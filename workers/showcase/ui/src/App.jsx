import { useState, useCallback } from 'react';
import { Box, Text, Flex, Badge, Button } from '@chakra-ui/react';
import { Layout } from './components/Layout';
import { LoadingScreen } from './components/LoadingScreen';
import { SearchControls } from './components/SearchControls';
import { ResultsList } from './components/ResultsList';
import { ClusterSummary } from './components/ClusterSummary';
import { useDataLoader } from './hooks/useDataLoader';
import { useSemanticSearch } from './hooks/useSemanticSearch';
import { useFulltextSearch } from './hooks/useFulltextSearch';

export function App() {
  const { progress, statusText, error, isReady, data, reload } = useDataLoader();

  const [modelProgress, setModelProgress] = useState({ pct: 0, text: '' });

  const { isModelLoaded, search: semanticSearch } = useSemanticSearch({
    vectorIndices: data.vectorIndices,
    onProgress: (p) => {
      if (p.status === 'progress' && p.progress != null) {
        setModelProgress({
          pct: 55 + Math.round(p.progress * 0.4),
          text: 'Loading model: ' + Math.round(p.progress) + '%',
        });
      }
      if (p.status === 'done') {
        setModelProgress({ pct: 95, text: 'Model loaded.' });
      }
    },
  });
  const { search: fulltextSearch } = useFulltextSearch(data.lunrIdx);

  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState('semantic');
  const [category, setCategory] = useState('all');
  const [results, setResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const semanticAvailable = isModelLoaded && !!data.vectorIndices;

  // If semantic not available once ready, default to fulltext
  const effectiveMode =
    searchMode === 'semantic' && !semanticAvailable ? 'fulltext' : searchMode;

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      if (effectiveMode === 'semantic') {
        const r = await semanticSearch(query, category, 15);
        setResults({ items: r, isSemantic: true });
      } else {
        const r = fulltextSearch(query, 15);
        setResults({ items: r, isSemantic: false });
      }
    } catch (err) {
      setResults({
        items: [],
        isSemantic: effectiveMode === 'semantic',
        error: err.message,
      });
    } finally {
      setIsSearching(false);
    }
  }, [query, effectiveMode, category, semanticSearch, fulltextSearch]);

  // Combine data loading progress with model loading progress
  const displayProgress = isReady
    ? modelProgress.pct || progress
    : progress;
  const displayStatus = isReady
    ? modelProgress.text || statusText
    : statusText;

  const showLoading = !isReady;

  return (
    <Layout>
      {showLoading ? (
        <LoadingScreen
          progress={displayProgress}
          statusText={displayStatus}
          error={error}
        />
      ) : (
        <>
          {data.interviews?.length > 0 && (
            <Box
              bg="surface.card"
              border="1px solid"
              borderColor="surface.border"
              borderRadius="md"
              p={4}
              mb={6}
            >
              <Flex justify="space-between" align="center" mb={3}>
                <Text fontWeight="600" fontSize="lg">
                  Loaded Interviews
                </Text>
                <Flex gap={2} align="center">
                  <Badge colorPalette="green" variant="subtle" size="lg">
                    {data.interviews.length} loaded
                  </Badge>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={reload}
                  >
                    Refresh
                  </Button>
                </Flex>
              </Flex>
              <Flex wrap="wrap" gap={2}>
                {data.interviews.map((iv) => (
                  <Box
                    key={iv.id}
                    px={3}
                    py={1.5}
                    bg="surface.hover"
                    borderRadius="md"
                    fontSize="sm"
                  >
                    <Text fontWeight="500">{iv.title || iv.id}</Text>
                    {iv.demographics && (
                      <Text fontSize="xs" color="fg.muted">
                        {[iv.demographics.college, iv.demographics.major, iv.demographics.graduationYear]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                    )}
                  </Box>
                ))}
              </Flex>
            </Box>
          )}
          <SearchControls
            query={query}
            onQueryChange={setQuery}
            searchMode={effectiveMode}
            onSearchModeChange={setSearchMode}
            category={category}
            onCategoryChange={setCategory}
            onSearch={handleSearch}
            isSearching={isSearching}
            semanticAvailable={semanticAvailable}
          />
          {results?.error && (
            <Box
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              p={4}
              borderRadius="md"
              color="red.600"
              fontSize="sm"
              mb={4}
            >
              Search error: {results.error}
            </Box>
          )}
          {results && (
            <ResultsList
              results={results.items}
              isSemantic={results.isSemantic}
              searchIndex={data.searchIndex}
              interviews={data.interviews}
              clusterMap={data.clusterMap}
            />
          )}
          <ClusterSummary clusters={data.clusters} />
        </>
      )}
    </Layout>
  );
}
