import { useState, useEffect, useRef, useCallback } from 'react';
import lunr from 'lunr';

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch ' + url + ' (' + res.status + ')');
  return res.json();
}

export function useDataLoader() {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Initializing...');
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  const dataRef = useRef({
    metadata: null,
    vectorIndices: null,
    searchIndex: null,
    clusters: null,
    interviews: null,
    lunrIdx: null,
    clusterMap: new Map(),
  });

  const reload = useCallback(() => {
    setIsReady(false);
    setError(null);
    setProgress(0);
    setStatusText('Refreshing...');
    dataRef.current.clusterMap = new Map();
    setLoadCount((c) => c + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    function update(pct, text) {
      if (cancelled) return;
      setProgress(pct);
      setStatusText(text);
    }

    // Cache-bust param for reloads
    const cacheBust = loadCount > 0 ? `?t=${Date.now()}` : '';

    async function init() {
      try {
        // Step 1: fetch metadata
        update(5, 'Fetching build metadata...');
        try {
          dataRef.current.metadata = await fetchJSON('/assets/build/metadata.json' + cacheBust);
        } catch {
          dataRef.current.metadata = null;
        }

        // Step 2: fetch data artifacts in parallel
        update(15, 'Loading search data...');
        const [vecRes, searchRes, clustersRes, interviewsRes] = await Promise.allSettled([
          fetchJSON('/assets/build/vector-indices.json' + cacheBust),
          fetchJSON('/assets/build/search-index.json' + cacheBust),
          fetchJSON('/assets/build/clusters.json' + cacheBust),
          fetchJSON('/assets/build/interviews.json' + cacheBust),
        ]);

        dataRef.current.vectorIndices = vecRes.status === 'fulfilled' ? vecRes.value : null;
        dataRef.current.searchIndex = searchRes.status === 'fulfilled' ? searchRes.value : null;
        dataRef.current.clusters = clustersRes.status === 'fulfilled' ? clustersRes.value : null;
        dataRef.current.interviews = interviewsRes.status === 'fulfilled' ? interviewsRes.value : null;

        update(40, 'Data loaded. Initializing search engine...');

        // Step 3: build Lunr index
        const searchIndex = dataRef.current.searchIndex;
        if (searchIndex?.index) {
          try {
            dataRef.current.lunrIdx = lunr.Index.load(searchIndex.index);
            update(50, 'Full-text search ready.');
          } catch {
            if (searchIndex.documents?.length) {
              dataRef.current.lunrIdx = lunr(function () {
                this.ref('id');
                this.field('title');
                this.field('content');
                this.field('category');
                this.field('demographics');
                for (const doc of searchIndex.documents) {
                  this.add(doc);
                }
              });
            }
            update(50, 'Full-text index rebuilt from documents.');
          }
        } else if (searchIndex?.documents?.length) {
          dataRef.current.lunrIdx = lunr(function () {
            this.ref('id');
            this.field('title');
            this.field('content');
            this.field('category');
            this.field('demographics');
            for (const doc of searchIndex.documents) {
              this.add(doc);
            }
          });
          update(50, 'Full-text index built from documents.');
        }

        // Step 4: normalize clusters (indexing pipeline stores Record<string, ClusterResult[]>
        // but the UI expects a flat array)
        let clusters = dataRef.current.clusters;
        if (clusters && !Array.isArray(clusters) && typeof clusters === 'object') {
          const flat = [];
          for (const [category, arr] of Object.entries(clusters)) {
            for (const cl of arr) {
              flat.push({ ...cl, category });
            }
          }
          dataRef.current.clusters = flat;
          clusters = flat;
        }

        // Step 5: build cluster lookup
        if (Array.isArray(clusters)) {
          for (const cl of clusters) {
            if (cl.members) {
              for (const m of cl.members) {
                dataRef.current.clusterMap.set(m.interviewId, cl.clusterId);
              }
            }
          }
        }

        if (cancelled) return;
        setIsReady(true);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadCount]);

  return { progress, statusText, error, isReady, data: dataRef.current, reload };
}
