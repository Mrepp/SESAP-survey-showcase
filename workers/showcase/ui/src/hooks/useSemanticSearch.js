import { useState, useEffect, useRef, useCallback } from 'react';

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
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const pipelineRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const { pipeline, env: transformersEnv } = await import(
          /* @vite-ignore */
          'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2'
        );
        transformersEnv.allowLocalModels = false;

        const pipe = await pipeline('feature-extraction', 'Xenova/bge-small-en-v1.5', {
          progress_callback: (progress) => {
            if (!cancelled) onProgress?.(progress);
          },
        });

        if (!cancelled) {
          pipelineRef.current = pipe;
          setIsModelLoaded(true);
        }
      } catch (err) {
        console.warn('Transformers.js model failed to load:', err);
      }
    }

    loadModel();
    return () => {
      cancelled = true;
    };
  }, []);

  const search = useCallback(
    async (query, category, topK = 15) => {
      if (!pipelineRef.current || !vectorIndices) return [];

      const output = await pipelineRef.current(query, { pooling: 'mean', normalize: true });
      const queryEmbedding = Array.from(output.data);

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
    [vectorIndices],
  );

  return { isModelLoaded, search };
}
