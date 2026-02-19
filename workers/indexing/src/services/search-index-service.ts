import type { Interview, CategoryEmbeddings, SearchIndex, SearchDocument, SearchEmbedding } from '@sesap/types';

/**
 * Build a unified search index combining Lunr full-text search with vector embeddings
 */
export function buildSearchIndex(
  interviews: Interview[],
  lunrResult: { index: object; documents: SearchDocument[] },
  categoryEmbeddings: CategoryEmbeddings[]
): SearchIndex {
  // Flatten all embeddings into a single list
  const embeddings: SearchEmbedding[] = [];

  for (const catEmbed of categoryEmbeddings) {
    const { interviewId, summary, themes, collegeExperience, quotes, tags } = catEmbed;

    // Add summary embedding
    if (summary && summary.length > 0) {
      embeddings.push({
        id: `${interviewId}-summary`,
        interviewId,
        embedding: summary,
      });
    }

    // Add themes embedding
    if (themes && themes.length > 0) {
      embeddings.push({
        id: `${interviewId}-themes`,
        interviewId,
        embedding: themes,
      });
    }

    // Add college experience embedding
    if (collegeExperience && collegeExperience.length > 0) {
      embeddings.push({
        id: `${interviewId}-collegeExperience`,
        interviewId,
        embedding: collegeExperience,
      });
    }

    // Add quotes embedding
    if (quotes && quotes.length > 0) {
      embeddings.push({
        id: `${interviewId}-quotes`,
        interviewId,
        embedding: quotes,
      });
    }

    // Add tag embeddings
    if (tags) {
      for (const [tag, embedding] of Object.entries(tags)) {
        if (embedding && embedding.length > 0) {
          embeddings.push({
            id: `${interviewId}-tag-${tag}`,
            interviewId,
            embedding,
          });
        }
      }
    }
  }

  return {
    index: lunrResult.index,
    documents: lunrResult.documents,
    embeddings,
  };
}
