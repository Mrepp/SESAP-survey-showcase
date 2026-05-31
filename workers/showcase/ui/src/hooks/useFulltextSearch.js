import { useCallback } from 'react';

function mapResults(results, topK) {
  return results.slice(0, topK).map((r) => ({
    id: r.ref,
    score: r.score,
    matchData: r.matchData,
  }));
}

function wildcardQuery(query) {
  return query
    .split(/\s+/)
    .map((t) => t.replace(/[^\w-]/g, ''))
    .filter(Boolean)
    .map((t) => t + '*')
    .join(' ');
}

export function useFulltextSearch(lunrIdx) {
  const search = useCallback(
    (query, topK = 15) => {
      if (!lunrIdx) return [];
      try {
        const results = lunrIdx.search(query);
        if (results.length > 0) return mapResults(results, topK);
      } catch {
        // Retry below with a sanitized wildcard query.
      }

      const fallbackQuery = wildcardQuery(query);
      if (!fallbackQuery) return [];

      try {
        const results = lunrIdx.search(fallbackQuery);
        return mapResults(results, topK);
      } catch {
        return [];
      }
    },
    [lunrIdx],
  );

  return { search };
}
