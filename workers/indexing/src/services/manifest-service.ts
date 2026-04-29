import type { Interview, BuildMetadata } from '@sesap/types';
import { R2_PATHS } from '@sesap/types';

const EMBEDDING_DIMENSION = 384; // MiniLM-L6-v2 dimension

/**
 * Build metadata manifest for the indexing build
 */
export function buildManifest(interviews: Interview[], tags: string[]): BuildMetadata {
  // Extract unique categories from interviews
  const categoriesSet = new Set<string>();

  for (const interview of interviews) {
    if (interview.analysis?.themes) {
      for (const theme of interview.analysis.themes) {
        if (theme.category) {
          categoriesSet.add(theme.category);
        }
      }
    }
  }

  const categories = Array.from(categoriesSet).sort();
  const buildId = generateBuildId();
  const timestamp = new Date().toISOString();

  return {
    buildId,
    timestamp,
    interviewCount: interviews.length,
    embeddingDimension: EMBEDDING_DIMENSION,
    categories,
    tags: tags.sort(),
    interviewIds: interviews.map((i) => i.id),
    artifactPaths: {
      vectorIndices: R2_PATHS.buildArtifact('vector-indices.json'),
      clusters: R2_PATHS.buildArtifact('clusters.json'),
      searchIndex: R2_PATHS.buildArtifact('search-index.json'),
      interviews: R2_PATHS.buildArtifact('interviews.json'),
      metadata: R2_PATHS.buildArtifact('metadata.json'),
    },
  };
}

/**
 * Generate a unique build ID
 */
function generateBuildId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `build-${timestamp}-${random}`;
}
