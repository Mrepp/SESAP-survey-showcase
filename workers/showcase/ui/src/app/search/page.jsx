'use client'
import {
    Box,
    Button,
    Container,
    GridItem,
    Link,
    Stack,
    StackSeparator,
    Text,
    VStack,
} from "@chakra-ui/react"
import { useState, useCallback, useMemo } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import { useSemanticSearch } from '@/hooks/useSemanticSearch'
import { useFulltextSearch } from '@/hooks/useFulltextSearch'
import SearchBar from "@/components/SearchBar"
import Result from '@/components/ResultsCard'
import Filters from '@/components/Filters'

function formatDate(value) {
    if (value == null) return ''
    const d = typeof value === 'string' ? new Date(value) : value
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

function mapSearchResultToCard(result, data) {
    const doc = data?.searchIndex?.documents?.find((d) => d.id === result.id) ?? null
    const interviewId = doc?.interviewId ?? result.id
    const interview = Array.isArray(data?.interviews)
        ? data.interviews.find((iv) => (iv.interviewId ?? iv.id) === interviewId || iv.id === result.id)
        : null
    const iv = interview ?? (doc ? data?.interviews?.find((i) => (i.interviewId ?? i.id) === doc.interviewId) : null) ?? null
    return {
        interviewId: iv?.id ?? doc?.interviewId ?? result.id,
        videoUrl: iv?.videoUrl ?? '/placeholder16x9.jpg',
        videoAlt: doc?.title || iv?.title || 'Interview',
        name: iv?.title ?? doc?.title ?? String(result.id),
        date: formatDate(iv?.metadata?.interviewDate),
        description: doc?.content ? (doc.content.substring(0, 200) + (doc.content.length > 200 ? '...' : '')) : (iv?.description ?? ''),
    }
}


export default function Search() {
    // Filter selections and clearing
    const [selectedThemes, setSelectedThemes] = useState([])
    const [selectedYears, setSelectedYears] = useState([])
    const [selectedSentiments, setSelectedSentiments] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    const clearAllFilters = () => {
        setSelectedThemes([])
        setSelectedYears([])
        setSelectedSentiments([])
        setSelectedCategories([])
    }

    // Data loading and search
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

    const resultCards = useMemo(() => {
        if (!results?.items || !data) return []
        return results.items.map((r) => mapSearchResultToCard(r, data))
    }, [results?.items, data])

    if (showLoading) {
        return (
            <VStack gap={3} textAlign="center" p={12}>
                {error ? (
                    <Box
                        bg="red.50"
                        border="1px solid"
                        borderColor="red.200"
                        p={4}
                        borderRadius="md"
                        color="red.600"
                        fontSize="sm"
                    >
                        Error: {error}
                    </Box>
                ) : (
                    <>
                        <Text fontSize="md">Loading search indexes...</Text>
                        <Box
                            w="100%"
                            maxW="400px"
                            h="8px"
                            bg="gray.200"
                            borderRadius="4px"
                            overflow="hidden"
                        >
                            <Box
                                h="100%"
                                w={`${displayProgress}%`}
                                bg="brand.500"
                                borderRadius="4px"
                                transition="width 0.3s ease"
                            />
                        </Box>
                        <Text fontSize="sm" color="fg.muted">
                            {displayStatus}
                        </Text>
                    </>
                )}
            </VStack>
        )
    }

    return (
        <>
            <Box marginBottom="50px">
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    onSearch={handleSearch}
                    isSearching={isSearching}
                    placeholder="Search interviews..."
                />
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>
                <Filters
                    selectedThemes={selectedThemes}
                    setSelectedThemes={setSelectedThemes}
                    selectedYears={selectedYears}
                    setSelectedYears={setSelectedYears}
                    selectedSentiments={selectedSentiments}
                    setSelectedSentiments={setSelectedSentiments}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />

                <Container paddingRight="0">
                    <Box marginBottom="20px" display="flex" justifyContent="space-between" alignItems="center">
                        <Text>
                            {results == null
                                ? 'Enter a query and click Search to see results.'
                                : `${resultCards.length} result${resultCards.length !== 1 ? 's' : ''}${query.trim() ? ` for "${query.trim()}"` : ''}`}
                        </Text>
                        <Button variant="surface" onClick={clearAllFilters}>
                            Clear Filter
                        </Button>
                    </Box>

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

                    {results != null && resultCards.length === 0 && !results.error && (
                        <Text color="fg.muted">No results found.</Text>
                    )}

                    <Box>
                        {resultCards.map((item, index) => (
                            <GridItem
                                key={item.interviewId + '-' + index}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                paddingBottom="15px"
                            >
                                <Link href={`/interviews/${item.interviewId}`} _hover={{ textDecoration: 'none' }}>
                                    <Result data={item} />
                                </Link>
                            </GridItem>
                        ))}
                    </Box>
                </Container>
            </Stack>
        </>
    )
}