import {
  AiBudgetError,
  Logger,
  ProcessingError,
  runWithAiBudget,
  WORKERS_AI_MODELS,
} from '@sesap/shared';
import type { Env } from '../bindings';

const MODEL_NAME = WORKERS_AI_MODELS.whisper;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

const logger = new Logger({ service: 'whisper-service' });

interface WhisperResponse {
  text?: string;
  vtt?: string;
  words?: Array<{ word: string; start: number; end: number }>;
  transcription_info?: Record<string, unknown>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encodeAudio(audioBytes: ArrayBuffer): string {
  const bytes = new Uint8Array(audioBytes);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, bytes.length));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return btoa(binary);
}

export async function transcribeAudio(
  env: Env,
  audioBytes: ArrayBuffer,
  context: { interviewId: string },
): Promise<string> {
  const sizeBytes = audioBytes.byteLength;
  if (sizeBytes === 0) {
    throw new ProcessingError('Audio is empty', { interviewId: context.interviewId });
  }

  logger.info('Starting transcription', {
    interviewId: context.interviewId,
    sizeBytes,
    model: MODEL_NAME,
  });

  const audio = encodeAudio(audioBytes);

  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const input = {
        audio,
        task: 'transcribe',
      };
      const response = (await runWithAiBudget(
        env,
        {
          model: MODEL_NAME,
          estimate: { kind: 'whisper', model: MODEL_NAME, audioByteLength: sizeBytes },
          context: { worker: 'processing', operation: 'transcription', interviewId: context.interviewId, attempt },
        },
        () => env.AI.run(MODEL_NAME as Parameters<Ai['run']>[0], input),
      )) as WhisperResponse;

      const text = (response.text ?? '').trim();
      if (!text) {
        throw new ProcessingError('Whisper returned empty transcript', {
          interviewId: context.interviewId,
          model: MODEL_NAME,
          attempt,
        });
      }

      logger.info('Transcription succeeded', {
        interviewId: context.interviewId,
        attempt,
        textLength: text.length,
      });
      return text;
    } catch (err) {
      if (err instanceof AiBudgetError) {
        throw err;
      }

      lastError = err;
      const message = err instanceof Error ? err.message : String(err);
      logger.error('Whisper attempt failed', {
        interviewId: context.interviewId,
        attempt,
        error: message,
      });

      if (attempt < MAX_RETRIES) {
        await sleep(BASE_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }

  throw new ProcessingError(`Failed to transcribe audio after ${MAX_RETRIES} attempts`, {
    interviewId: context.interviewId,
    model: MODEL_NAME,
    sizeBytes,
    lastError: lastError instanceof Error ? lastError.message : String(lastError),
  });
}
