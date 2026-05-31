import { useState, useCallback } from 'react';

function cosineSimilarity(a, b) {
  let dot = 0,
    na = 0,
    nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

export function useSemanticSearch({ vectorIndices, onProgress }) {
  const [loadError, setLoadError] = useState(null);
  const isModelLoaded = !!vectorIndices && !loadError;

  const search = useCallback(
    async (query, category, topK = 15) => {
      if (!vectorIndices) return [];

      onProgress?.({ status: 'progress', progress: 25 });

      const res = await fetch('/api/search/embed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        let message = `Semantic search failed (${res.status})`;
        try {
          const body = await res.json();
          message = body.message || body.error || message;
        } catch {
          // Keep the status-derived message when the response is not JSON.
        }
        setLoadError(message);
        throw new Error(message);
      }

      const body = await res.json();
      const queryEmbedding = Array.isArray(body.embedding) ? body.embedding : [];
      if (queryEmbedding.length === 0) {
        const message = 'Semantic search returned an empty embedding';
        setLoadError(message);
        throw new Error(message);
      }

      setLoadError(null);
      onProgress?.({ status: 'done' });

      const categoriesToSearch =
        category === 'all'
          ? ['summary', 'themes', 'collegeExperience', 'quotes']
          : [category];

      const scored = [];

      for (const cat of categoriesToSearch) {
        const entries = vectorIndices[cat];
        if (!entries) continue;
        for (const entry of entries) {
          const score = cosineSimilarity(queryEmbedding, entry.embedding);
          scored.push({ id: entry.id, index: entry.index, score, category: cat });
        }
      }

      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, topK);
    },
    [vectorIndices, onProgress],
  );

  return { isModelLoaded, loadError, search };
}
