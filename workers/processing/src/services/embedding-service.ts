import type { InterviewEmbeddings, EmbeddingVector } from '@sesap/types';
import {
  AiBudgetError,
  Logger,
  ProcessingError,
  runWithAiBudget,
  WORKERS_AI_MODELS,
} from '@sesap/shared';
import type { Env } from '../bindings';
import type { EmbeddableChunk } from './transcript-parser';

const EMBEDDING_MODEL = WORKERS_AI_MODELS.embedding;
const EMBEDDING_DIMENSION = 384;
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 200;

const logger = new Logger({ service: 'embedding-service' });

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateEmbeddings(
  env: Env,
  interviewId: string,
  items: EmbeddableChunk[],
): Promise<InterviewEmbeddings> {
  logger.info('Generating embeddings', { interviewId, itemCount: items.length });

  const vectors: EmbeddingVector[] = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    const texts = batch.map((item) => item.text);

    try {
      const input = {
        text: texts,
      };
      const result = (await runWithAiBudget(
        env,
        {
          model: EMBEDDING_MODEL,
          estimate: { kind: 'embedding', model: EMBEDDING_MODEL, text: texts },
          context: { worker: 'processing', operation: 'embedding', interviewId, batchStart: i },
        },
        () => env.AI.run(EMBEDDING_MODEL as Parameters<Ai['run']>[0], input),
      )) as { data: number[][] };

      if (!result.data || result.data.length !== batch.length) {
        throw new ProcessingError(
          `Embedding response mismatch: expected ${batch.length}, got ${result.data?.length ?? 0}`,
        );
      }

      for (let j = 0; j < batch.length; j++) {
        vectors.push({
          id: batch[j].id,
          type: batch[j].type,
          text: batch[j].text,
          embedding: result.data[j],
          dimension: EMBEDDING_DIMENSION,
        });
      }

      logger.debug('Batch embedded', {
        interviewId,
        batchStart: i,
        batchSize: batch.length,
      });
    } catch (err) {
      if (err instanceof AiBudgetError) throw err;
      if (err instanceof ProcessingError) throw err;
      throw new ProcessingError(
        `Embedding generation failed at batch starting index ${i}`,
        { interviewId, error: err instanceof Error ? err.message : String(err) },
      );
    }

    // Rate limit: pause between batches
    if (i + BATCH_SIZE < items.length) {
      await sleep(BATCH_DELAY_MS);
    }
  }

  const embeddings: InterviewEmbeddings = {
    interviewId,
    model: EMBEDDING_MODEL,
    dimension: EMBEDDING_DIMENSION,
    vectors,
    generatedAt: new Date().toISOString(),
  };

  logger.info('Embeddings generated', {
    interviewId,
    vectorCount: vectors.length,
  });

  return embeddings;
}
