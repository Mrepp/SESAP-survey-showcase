import type { Env } from '../bindings';
import type { ProcessingQueueMessage, InterviewRecord } from '@sesap/types';
import { R2_PATHS, KV_KEYS } from '@sesap/types';
import { Logger, NotFoundError, ProcessingError } from '@sesap/shared';
import { generateAnalysis } from './llm-service';
import { generateEmbeddings } from './embedding-service';
import { extractChunksFromAnalysis } from './transcript-parser';

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
    // 4. Fetch transcript from R2 (verified before queuing, should exist)
    const transcriptObject = await env.SESAP_BUCKET.get(R2_PATHS.transcript(interviewId));
    if (!transcriptObject) {
      throw new NotFoundError('Transcript', interviewId);
    }
    const transcript = await transcriptObject.text();
    log.info('Transcript fetched', { length: transcript.length });

    // 5. Generate analysis via LLM
    const analysis = await generateAnalysis(env, interviewId, transcript);

    // 6. Store analysis to R2
    await env.SESAP_BUCKET.put(
      R2_PATHS.analysis(interviewId),
      JSON.stringify(analysis),
    );
    record.artifacts.analysis = true;
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
    record.updatedAt = new Date().toISOString();
    await env.SESAP_KV.put(KV_KEYS.interview(interviewId), JSON.stringify(record));
    log.info('Processing completed');
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
    if (err instanceof ProcessingError && errorDetails) {
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
    if (!(err instanceof ProcessingError)) {
      throw err;
    }
  }
}
