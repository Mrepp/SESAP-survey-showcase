import type { Interview, CategoryEmbeddings } from '@sesap/types';
import {
  AiBudgetError,
  Logger,
  ProcessingError,
  runWithAiBudget,
  WORKERS_AI_MODELS,
} from '@sesap/shared';
import type { Env } from '../bindings';

const EMBEDDING_MODEL = WORKERS_AI_MODELS.embedding;
const BATCH_SIZE = 50;
const BATCH_DELAY_MS = 200;

const logger = new Logger({ service: 'category-embedding-service' });

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate embeddings for a batch of texts using Cloudflare AI.
 */
async function generateEmbeddingBatch(
  env: Env,
  texts: string[],
): Promise<number[][]> {
  try {
    const input = {
      text: texts,
    };
    const result = (await runWithAiBudget(
      env,
      {
        model: EMBEDDING_MODEL,
        estimate: { kind: 'embedding', model: EMBEDDING_MODEL, text: texts },
        context: { worker: 'indexing', operation: 'category-embedding' },
      },
      () => env.AI.run(EMBEDDING_MODEL as Parameters<Ai['run']>[0], input),
    )) as { data: number[][] };

    if (!result.data || result.data.length !== texts.length) {
      throw new ProcessingError(
        `Embedding response mismatch: expected ${texts.length}, got ${result.data?.length ?? 0}`,
      );
    }

    return result.data;
  } catch (err) {
    if (err instanceof AiBudgetError) throw err;
    if (err instanceof ProcessingError) throw err;
    throw new ProcessingError('Embedding generation failed', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/**
 * Compute the average (centroid) of multiple embedding vectors.
 */
function averageEmbeddings(embeddings: number[][]): number[] {
  if (embeddings.length === 0) {
    throw new ProcessingError('Cannot average empty embeddings array');
  }

  const dimension = embeddings[0].length;
  const sum = new Array(dimension).fill(0);

  for (const embedding of embeddings) {
    for (let i = 0; i < dimension; i++) {
      sum[i] += embedding[i];
    }
  }

  return sum.map((val) => val / embeddings.length);
}

/**
 * Generate category embeddings for each interview.
 *
 * For each interview, create composite embeddings for:
 * - summary: Combined from all summaries
 * - themes: Combined from all theme titles and descriptions
 * - collegeExperience: Combined from timeline events
 * - quotes: Combined from all quote texts
 * - tags: Individual embeddings for each unique tag
 *
 * Uses batching to respect API rate limits.
 */
export async function generateCategoryEmbeddings(
  env: Env,
  interviews: Interview[],
): Promise<CategoryEmbeddings[]> {
  logger.info('Generating category embeddings', { interviewCount: interviews.length });

  const allCategoryEmbeddings: CategoryEmbeddings[] = [];

  for (const interview of interviews) {
    if (!interview.analysis) {
      logger.warn('Interview missing analysis', { interviewId: interview.id });
      continue;
    }

    const { analysis } = interview;

    // Prepare texts for each category
    const summaryTexts = analysis.summaries.map((s) => s.summaryText);
    const themeTexts = analysis.themes.map((t) => `${t.title}: ${t.description}`);
    const timelineTexts = analysis.timeline.map((tp) => `${tp.event} (${tp.period}): ${tp.significance}`);
    const quoteTexts = analysis.quotes.map((q) => q.quoteText);

    // Collect all unique tags across all quotes
    const uniqueTags = new Set<string>();
    for (const quote of analysis.quotes) {
      for (const tag of quote.tags) {
        uniqueTags.add(tag);
      }
    }

    // Build a list of all texts to embed, keeping track of their category
    const textsToEmbed: string[] = [];
    const categoryMap: { category: string; count: number }[] = [];

    // Add summary texts
    if (summaryTexts.length > 0) {
      textsToEmbed.push(...summaryTexts);
      categoryMap.push({ category: 'summary', count: summaryTexts.length });
    }

    // Add theme texts
    if (themeTexts.length > 0) {
      textsToEmbed.push(...themeTexts);
      categoryMap.push({ category: 'themes', count: themeTexts.length });
    }

    // Add timeline texts (collegeExperience)
    if (timelineTexts.length > 0) {
      textsToEmbed.push(...timelineTexts);
      categoryMap.push({ category: 'collegeExperience', count: timelineTexts.length });
    }

    // Add quote texts
    if (quoteTexts.length > 0) {
      textsToEmbed.push(...quoteTexts);
      categoryMap.push({ category: 'quotes', count: quoteTexts.length });
    }

    // Add unique tags
    const tagArray = Array.from(uniqueTags);
    if (tagArray.length > 0) {
      textsToEmbed.push(...tagArray);
      categoryMap.push({ category: 'tags', count: tagArray.length });
    }

    // Generate embeddings in batches
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < textsToEmbed.length; i += BATCH_SIZE) {
      const batch = textsToEmbed.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await generateEmbeddingBatch(env, batch);
      allEmbeddings.push(...batchEmbeddings);

      logger.debug('Generated embedding batch', {
        interviewId: interview.id,
        batchStart: i,
        batchSize: batch.length,
      });

      // Rate limit: pause between batches
      if (i + BATCH_SIZE < textsToEmbed.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }

    // Split embeddings back into categories and compute averages
    let offset = 0;
    const categoryEmbeddings: Partial<CategoryEmbeddings> = {
      interviewId: interview.id,
      tags: {},
    };

    for (const { category, count } of categoryMap) {
      const categoryVectors = allEmbeddings.slice(offset, offset + count);
      offset += count;

      if (category === 'tags') {
        // For tags, create individual embeddings for each tag
        const tags: Record<string, number[]> = {};
        for (let i = 0; i < tagArray.length; i++) {
          tags[tagArray[i]] = categoryVectors[i];
        }
        categoryEmbeddings.tags = tags;
      } else {
        // For other categories, compute the average embedding
        const avgEmbedding = averageEmbeddings(categoryVectors);
        categoryEmbeddings[category as keyof Omit<CategoryEmbeddings, 'interviewId' | 'tags'>] = avgEmbedding;
      }
    }

    // Ensure all required fields are present (use empty arrays if no data)
    const finalEmbeddings: CategoryEmbeddings = {
      interviewId: interview.id,
      summary: categoryEmbeddings.summary ?? [],
      themes: categoryEmbeddings.themes ?? [],
      collegeExperience: categoryEmbeddings.collegeExperience ?? [],
      quotes: categoryEmbeddings.quotes ?? [],
      tags: categoryEmbeddings.tags ?? {},
    };

    allCategoryEmbeddings.push(finalEmbeddings);

    logger.debug('Generated category embeddings', {
      interviewId: interview.id,
      tagCount: Object.keys(finalEmbeddings.tags).length,
    });
  }

  logger.info('Category embeddings generated', {
    interviewCount: allCategoryEmbeddings.length,
  });

  return allCategoryEmbeddings;
}
