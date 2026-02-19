import { useCallback } from 'react';

export function useFulltextSearch(lunrIdx) {
  const search = useCallback(
    (query, topK = 15) => {
      if (!lunrIdx) return [];
      try {
        const results = lunrIdx.search(query);
        return results.slice(0, topK).map((r) => ({
          id: r.ref,
          score: r.score,
          matchData: r.matchData,
        }));
      } catch {
        try {
          const results = lunrIdx.search(
            query
              .split(/\s+/)
              .map((t) => t + '*')
              .join(' '),
          );
          return results.slice(0, topK).map((r) => ({
            id: r.ref,
            score: r.score,
            matchData: r.matchData,
          }));
        } catch {
          return [];
        }
      }
    },
    [lunrIdx],
  );

  return { search };
}
