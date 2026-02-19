import type { Interview, CategoryEmbeddings, VectorIndices } from '@sesap/types';
import { Logger } from '@sesap/shared';

const logger = new Logger({ service: 'vector-index-service' });

/**
 * Build vector indices from interviews and their category embeddings.
 *
 * Creates separate VectorIndexEntry[] arrays for:
 * - summary: One entry per interview
 * - themes: One entry per interview
 * - collegeExperience: One entry per interview
 * - quotes: One entry per interview
 * - tags: One entry per tag (across all interviews)
 *
 * Each entry includes:
 * - id: The interview ID (or tag name for tags)
 * - index: The position in the original interviews array
 * - embedding: The category embedding vector
 */
export function buildVectorIndices(
  interviews: Interview[],
  categoryEmbeddings: CategoryEmbeddings[],
): VectorIndices {
  logger.info('Building vector indices', {
    interviewCount: interviews.length,
    embeddingCount: categoryEmbeddings.length,
  });

  // Create a map from interview ID to index for quick lookup
  const interviewIndexMap = new Map<string, number>();
  for (let i = 0; i < interviews.length; i++) {
    interviewIndexMap.set(interviews[i].id, i);
  }

  // Initialize the indices
  const indices: VectorIndices = {
    summary: [],
    themes: [],
    collegeExperience: [],
    quotes: [],
    tags: {},
  };

  // Build indices for each category
  for (const catEmb of categoryEmbeddings) {
    const index = interviewIndexMap.get(catEmb.interviewId);
    if (index === undefined) {
      logger.warn('Interview not found in index map', { interviewId: catEmb.interviewId });
      continue;
    }

    // Summary index
    if (catEmb.summary.length > 0) {
      indices.summary.push({
        id: catEmb.interviewId,
        index,
        embedding: catEmb.summary,
      });
    }

    // Themes index
    if (catEmb.themes.length > 0) {
      indices.themes.push({
        id: catEmb.interviewId,
        index,
        embedding: catEmb.themes,
      });
    }

    // College experience index
    if (catEmb.collegeExperience.length > 0) {
      indices.collegeExperience.push({
        id: catEmb.interviewId,
        index,
        embedding: catEmb.collegeExperience,
      });
    }

    // Quotes index
    if (catEmb.quotes.length > 0) {
      indices.quotes.push({
        id: catEmb.interviewId,
        index,
        embedding: catEmb.quotes,
      });
    }

    // Tags index - aggregate across interviews
    for (const [tag, embedding] of Object.entries(catEmb.tags)) {
      if (!indices.tags[tag]) {
        indices.tags[tag] = [];
      }
      indices.tags[tag].push({
        id: catEmb.interviewId,
        index,
        embedding,
      });
    }
  }

  logger.info('Vector indices built', {
    summaryCount: indices.summary.length,
    themesCount: indices.themes.length,
    collegeExperienceCount: indices.collegeExperience.length,
    quotesCount: indices.quotes.length,
    tagCount: Object.keys(indices.tags).length,
  });

  return indices;
}
