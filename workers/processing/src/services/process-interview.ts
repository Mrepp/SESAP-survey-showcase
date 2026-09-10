import type { Env } from '../bindings';
import type { Demographics, ProcessingQueueMessage, InterviewRecord } from '@sesap/types';
import { R2_PATHS, KV_KEYS } from '@sesap/types';
import {
  Logger,
  NotFoundError,
  ProcessingError,
  AiBudgetError,
  currentPromptStamp,
  normalizeDemographics,
} from '@sesap/shared';
import { generateAnalysis } from './llm-service';
import { generateEmbeddings } from './embedding-service';
import { extractChunksFromAnalysis } from './transcript-parser';
import { transcribeAudio } from './whisper-service';
import { fetchMedia as fetchKalturaMedia } from './kaltura-service';

const DEFAULT_COLLEGE = 'Oregon State University';
const DEMOGRAPHIC_KEYS = ['college', 'graduationYear', 'major', 'gender', 'ethnicity'] as const;

/**
 * Demographics the model may never write onto a self-service record.
 *
 * The transcript is the contributor's own audio, so the analysis prompt is an
 * injectable surface, and the prompt's own "do not infer gender or ethnicity"
 * guardrail is itself an instruction to the model being injected. A
 * self-service record arrives with `major` and `graduationYear` already
 * self-reported through the wizard, so inference of these two adds no data —
 * and writing a gender or ethnicity onto a record the contributor asked to
 * publish anonymously is a re-identification risk in exchange for nothing.
 *
 * Admin-authored interviews keep the previous behavior: their transcripts come
 * from staff-conducted interviews rather than from the open internet.
 */
const SELF_SERVICE_BLOCKED_DEMOGRAPHICS = ['gender', 'ethnicity'] as const;

function mergeDemographics(
  existing: Demographics | undefined,
  inferred: Partial<Demographics>,
  { allowInferredIdentity }: { allowInferredIdentity: boolean },
): Demographics {
  const next: Demographics = { ...(existing ?? {}) };
  const blocked: readonly string[] = allowInferredIdentity
    ? []
    : SELF_SERVICE_BLOCKED_DEMOGRAPHICS;

  for (const key of DEMOGRAPHIC_KEYS) {
    if (blocked.includes(key)) continue;
    if (!next[key] && inferred[key]) {
      next[key] = inferred[key];
    }
  }
  if (!next.college) next.college = DEFAULT_COLLEGE;
  return next;
}

const logger = new Logger({ worker: 'sesap-processing', module: 'process-interview' });

// Transcript length limit for better error messages
const MAX_TRANSCRIPT_CHARS = 50000;

export async function processInterview(
  env: Env,
  message: ProcessingQueueMessage,
): Promise<void> {
  const { interviewId } = message;
  const log = logger.child({ interviewId });

  // 1. Load current state
  const recordRaw = await env.SESAP_KV.get(KV_KEYS.interview(interviewId));
  if (!recordRaw) {
    throw new NotFoundError('Interview', interviewId);
  }

  const record: InterviewRecord = JSON.parse(recordRaw);

  // Queue messages are not authority to process contributor media. This is
  // deliberately checked here as well as at the admin endpoint, so injected,
  // retried, and HTTP-development invocations cannot bypass moderation.
  if (
    record.origin === 'self_service' &&
    (!record.approval.preAnalysisReviewedAt || record.approval.status === 'rejected')
  ) {
    log.warn('Refusing unmoderated self-service processing request');
    return;
  }

  // 2. Idempotency: skip if already completed
  if (record.processing.status === 'completed') {
    log.info('Interview already processed, skipping');
    return;
  }

  // 3. Update to 'processing'
  record.processing.status = 'processing';
  record.processing.startedAt = new Date().toISOString();
  record.processing.retryCount = (record.processing.retryCount || 0) + 1;
  record.updatedAt = new Date().toISOString();
  await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));
  log.info('Processing started');

  try {
    // 4a. Transcribe audio if the interview was uploaded as video/Kaltura
    if (!record.artifacts.transcript) {
      record.processing.status = 'transcribing';
      record.updatedAt = new Date().toISOString();
      await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));
      log.info('Transcription started', { source: record.source });

      let audioBytes: ArrayBuffer;
      if (record.source === 'audio') {
        if (!record.audioRef) {
          throw new ProcessingError('Audio source missing audioRef', { interviewId });
        }
        const audioObject = await env.SESAP_BUCKET.get(record.audioRef.key);
        if (!audioObject) {
          throw new NotFoundError('Audio', interviewId);
        }
        audioBytes = await audioObject.arrayBuffer();
      } else if (record.source === 'kaltura') {
        if (!record.kalturaRef) {
          throw new ProcessingError('Kaltura source missing kalturaRef', { interviewId });
        }
        audioBytes = await fetchKalturaMedia(record.kalturaRef);
      } else {
        throw new ProcessingError(
          `Cannot transcribe — source '${record.source}' has no media reference`,
          { interviewId, source: record.source },
        );
      }

      const transcriptText = await transcribeAudio(env, audioBytes, { interviewId });
      await env.SESAP_BUCKET.put(R2_PATHS.transcript(interviewId), transcriptText);
      log.info('Transcript stored', { length: transcriptText.length });

      record.artifacts.transcript = true;
      record.processing.transcribedAt = new Date().toISOString();

      if (record.source === 'audio' && record.audioRef) {
        await env.SESAP_BUCKET.delete(record.audioRef.key);
        record.audioRef = undefined;
        log.info('Temporary audio deleted');
      }

      record.processing.status = 'processing';
      record.updatedAt = new Date().toISOString();
      await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));
    }

    // 4b. Fetch transcript from R2 (verified before queuing, should exist)
    const transcriptObject = await env.SESAP_BUCKET.get(R2_PATHS.transcript(interviewId));
    if (!transcriptObject) {
      throw new NotFoundError('Transcript', interviewId);
    }
    const transcript = await transcriptObject.text();
    log.info('Transcript fetched', { length: transcript.length });

    // 5. Generate analysis via LLM
    const analysis = await generateAnalysis(env, interviewId, transcript);

    // Stamp analysis with current prompt + schema versions
    analysis.promptVersion = currentPromptStamp.promptVersion;
    analysis.promptHash = currentPromptStamp.promptHash;
    analysis.schemaVersion = currentPromptStamp.schemaVersion;

    // 5a. Merge LLM-inferred demographics into the record (blanks only).
    //     The normalizer collapses common abbreviations and casing so that
    //     "CS" / "computer science" / "Computer Science" all sort together.
    //     Inferred `gender`/`ethnicity` are dropped for self-service records;
    //     see SELF_SERVICE_BLOCKED_DEMOGRAPHICS.
    const inferred = normalizeDemographics(analysis.demographics);
    const allowInferredIdentity = record.origin !== 'self_service';
    record.demographics = mergeDemographics(record.demographics, inferred, {
      allowInferredIdentity,
    });
    log.info('Demographics merged', {
      allowInferredIdentity,
      inferredKeys: Object.keys(inferred).filter((k) => (inferred as Record<string, unknown>)[k]),
    });

    // Drop the inferred demographics from the persisted analysis JSON — the
    // canonical copy lives on the InterviewRecord. Keeps Analysis focused
    // on analytic output and avoids two sources of truth.
    delete analysis.demographics;

    // 6. Store analysis to R2
    await env.SESAP_BUCKET.put(
      R2_PATHS.analysis(interviewId),
      JSON.stringify(analysis),
    );
    record.artifacts.analysis = true;
    record.analysisStamp = { ...currentPromptStamp };
    log.info('Analysis stored');

    // 7. Extract embeddable chunks from analysis
    const chunks = extractChunksFromAnalysis(interviewId, analysis);
    log.info('Chunks extracted', { chunkCount: chunks.length });

    // 8. Generate embeddings
    const embeddings = await generateEmbeddings(env, interviewId, chunks);

    // 9. Store embeddings to R2
    await env.SESAP_BUCKET.put(
      R2_PATHS.embeddings(interviewId),
      JSON.stringify(embeddings),
    );
    record.artifacts.embeddings = true;
    log.info('Embeddings stored');

    // 10. Update to 'completed'
    record.processing.status = 'completed';
    record.processing.completedAt = new Date().toISOString();
    // The raw-media gate has passed and analysis now exists. The next gate is
    // the contributor's review; intake mints its one-time link from the event.
    if (record.origin === 'self_service' && record.approval.status === 'pending_media_review') {
      record.approval.status = 'pending_submitter_review';
    }
    record.updatedAt = new Date().toISOString();
    await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));
    log.info('Processing completed');
    if (record.origin === 'self_service' && env.NOTIFICATION_QUEUE) {
      try {
        await env.NOTIFICATION_QUEUE.send({
          kind: 'processed', interviewId, queuedAt: new Date().toISOString(), reason: message.metadata?.reason,
        });
      } catch (notificationError) {
        // Completion is durable already; a courtesy-mail outage must not
        // convert a successful analysis into a failed processing run.
        log.error('Failed to enqueue completion notification', {
          error: notificationError instanceof Error ? notificationError.message : String(notificationError),
        });
      }
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorDetails = err instanceof ProcessingError ? err.details : undefined;

    log.error('Processing failed', {
      error: errorMessage,
      errorType: err instanceof Error ? err.constructor.name : typeof err,
      details: errorDetails,
    });

    // Build user-friendly error message
    let userMessage = errorMessage;
    if (err instanceof AiBudgetError) {
      userMessage = err.statusCode === 429
        ? 'Workers AI daily neuron budget exhausted. Processing can resume after the daily reset at 00:00 UTC.'
        : `Workers AI budget limiter is not configured: ${errorMessage}`;
    } else if (err instanceof ProcessingError && errorDetails) {
      const details = errorDetails as Record<string, unknown>;

      if (details.transcriptLength && typeof details.transcriptLength === 'number') {
        const charCount = details.transcriptLength;
        if (charCount > MAX_TRANSCRIPT_CHARS) {
          userMessage = `Transcript too long (${charCount} characters). Please reduce to under ${MAX_TRANSCRIPT_CHARS} characters.`;
        }
      }

      if (details.model) {
        userMessage += ` (Model: ${details.model})`;
      }

      if (errorMessage.includes('Empty response from LLM')) {
        userMessage = 'AI model returned no response. This may be a temporary issue. Please try again.';
      } else if (errorMessage.includes('Invalid JSON from LLM')) {
        userMessage = 'AI model returned invalid data format. Please try again or contact support.';
      } else if (errorMessage.includes('Schema validation failed')) {
        userMessage = 'AI model response did not match expected format. Please try again.';
      } else if (errorMessage.includes('Failed to generate analysis after')) {
        userMessage = 'Failed to analyze transcript after multiple attempts. The AI service may be unavailable or the transcript may be too complex. Please try again later or with a shorter transcript.';
      }
    }

    // 11. Update to 'failed'
    record.processing.status = 'failed';
    record.processing.failedAt = new Date().toISOString();
    record.processing.error = userMessage;
    record.updatedAt = new Date().toISOString();
    await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));

    // Only re-throw transient errors so the queue retries them.
    // ProcessingError from the LLM service already exhausted its own retries,
    // so retrying at the queue level just flip-flops the status.
    if (!(err instanceof ProcessingError) && !(err instanceof AiBudgetError)) {
      throw err;
    }
  }
}
