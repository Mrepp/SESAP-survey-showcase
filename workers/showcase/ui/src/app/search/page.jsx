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

function buildThemeOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const titles = new Set()
    for (const iv of interviews) {
        const themes = iv.analysis?.themes
        if (!Array.isArray(themes)) continue
        for (const t of themes) {
            if (t.title) titles.add(t.title)
        }
    }
    if (titles.size === 0) return null
    return Array.from(titles).sort().map((t) => ({ label: t, value: t.toLowerCase() }))
}

function buildYearOptions(interviews) {
    if (!Array.isArray(interviews)) return null
    const years = new Set()
    for (const iv of interviews) {
        const gy = iv.demographics?.graduationYear ?? iv.demographics?.year
        const num = Number(gy)
        if (num && num >= 1900 && num <= 2100) years.add(num)
    }
    if (years.size === 0) return null
    const sorted = Array.from(years).sort((a, b) => a - b)
    const minYear = Math.floor(sorted[0] / 5) * 5
    const maxYear = Math.ceil((sorted[sorted.length - 1] + 1) / 5) * 5
    const ranges = []
    for (let start = minYear; start < maxYear; start += 5) {
        const end = start + 4
        const label = `${start}-${end}`
        ranges.push({ label, value: label })
    }
    return ranges.length > 0 ? ranges : null
}

function yearInRange(year, rangeStr) {
    const [startStr, endStr] = rangeStr.split('-')
    const start = Number(startStr)
    const end = Number(endStr)
    return year >= start && year <= end
}

function getInterviewForResult(resultCard, data) {
    if (!Array.isArray(data?.interviews)) return null
    return data.interviews.find((iv) => (iv.interviewId ?? iv.id) === resultCard.interviewId) ?? null
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

    const { isModelLoaded, loadError: semanticLoadError, search: semanticSearch } = useSemanticSearch({
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

    // Build dynamic filter options from interview data
    const themeOptions = useMemo(() => buildThemeOptions(data?.interviews), [data?.interviews])
    const yearOptions = useMemo(() => buildYearOptions(data?.interviews), [data?.interviews])

    // Apply filters to result cards
    const filteredCards = useMemo(() => {
        const hasThemes = selectedThemes.length > 0
        const hasYears = selectedYears.length > 0
        const hasSentiments = selectedSentiments.length > 0
        const hasCategories = selectedCategories.length > 0
        if (!hasThemes && !hasYears && !hasSentiments && !hasCategories) return resultCards

        return resultCards.filter((card) => {
            const iv = getInterviewForResult(card, data)
            if (!iv) return true // keep results we can't resolve

            if (hasThemes) {
                const ivThemes = (iv.analysis?.themes ?? []).map((t) => (t.title ?? '').toLowerCase())
                if (!selectedThemes.some((st) => ivThemes.includes(st))) return false
            }

            if (hasYears) {
                const gy = Number(iv.demographics?.graduationYear ?? iv.demographics?.year)
                if (!gy || !selectedYears.some((range) => yearInRange(gy, range))) return false
            }

            if (hasSentiments) {
                const ivSentiments = new Set((iv.analysis?.quotes ?? []).map((q) => (q.sentiment ?? '').toLowerCase()))
                if (!selectedSentiments.some((s) => ivSentiments.has(s))) return false
            }

            if (hasCategories) {
                const doc = data?.searchIndex?.documents?.find((d) => d.interviewId === card.interviewId)
                const cat = (doc?.category ?? '').toLowerCase().replace(/\s+/g, '-')
                if (!selectedCategories.includes(cat)) return false
            }

            return true
        })
    }, [resultCards, selectedThemes, selectedYears, selectedSentiments, selectedCategories, data])

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
                {semanticLoadError && (
                    <Box bg="yellow.50" border="1px solid" borderColor="yellow.200" p={3} borderRadius="md" fontSize="sm" mt={3}>
                        Semantic search unavailable. Using keyword search instead.
                    </Box>
                )}
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
                    themeOptions={themeOptions}
                    yearOptions={yearOptions}
                />

                <Container paddingRight="0">
                    <Box marginBottom="20px" display="flex" justifyContent="space-between" alignItems="center">
                        <Text>
                            {results == null
                                ? 'Enter a query and click Search to see results.'
                                : `${filteredCards.length} result${filteredCards.length !== 1 ? 's' : ''}${query.trim() ? ` for "${query.trim()}"` : ''}${filteredCards.length < resultCards.length ? ` (filtered from ${resultCards.length})` : ''}`}
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

                    {results != null && filteredCards.length === 0 && !results.error && (
                        <Text color="fg.muted">No results found.</Text>
                    )}

                    <Box>
                        {filteredCards.map((item, index) => (
                            <GridItem
                                key={item.interviewId + '-' + index}
                                display="flex"
                                justifyContent="center"
                                alignItems="center"
                                paddingBottom="15px"
                            >
                                <Link href={`/interviews/view?id=${item.interviewId}`} _hover={{ textDecoration: 'none' }}>
                                    <Result data={item} highlightQuery={query} />
                                </Link>
                            </GridItem>
                        ))}
                    </Box>
                </Container>
            </Stack>
        </>
    )
}