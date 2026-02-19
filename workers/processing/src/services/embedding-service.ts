import type { InterviewEmbeddings, EmbeddingVector } from '@sesap/types';
import { Logger, ProcessingError } from '@sesap/shared';
import type { Env } from '../bindings';
import type { EmbeddableChunk } from './transcript-parser';

const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5';
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
      const result = (await env.AI.run(EMBEDDING_MODEL as Parameters<Ai['run']>[0], {
        text: texts,
      })) as { data: number[][] };

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
