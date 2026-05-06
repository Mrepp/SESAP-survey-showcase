'use client'
import {
    Box,
    CloseButton,
    Dialog,
    Grid,
    Heading,
    Portal,
    Text,
} from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import BarChart, { barChartMeta } from '@/components/visualizations/BarChart'
import BubbleChart, { bubbleChartMeta } from "@/components/visualizations/BubbleChart"
import Correlation, { correlationHeatMapMeta } from '@/components/visualizations/CorrelationHeatMap'
import MajorDoughnutChart, { majorDoughnutChartMeta } from '@/components/visualizations/MajorDoughnutChart'
import WordCloud, { wordCloudMeta } from "@/components/visualizations/WordCloud"

// Aggregate themes across all interviews for BubbleChart
function buildBubbleData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeMap = new Map()
    for (const iv of interviews) {
        for (const t of (iv.analysis?.themes ?? [])) {
            const title = String(t.title ?? '').trim()
            if (title) {
                if (!themeMap.has(title)) {
                    themeMap.set(title, { title, totalFreq: 0, count: 0, category: t.category ?? 'other' })
                }
                const entry = themeMap.get(title)
                entry.totalFreq += (Number(t.frequency) || 1)
                entry.count += 1
            }
        }
    }
    return Array.from(themeMap.values()).map(e => ({
        title: e.title,
        impactScore: Math.round(e.totalFreq / e.count),
        category: e.category,
    }))
}

// Build word cloud text from all quotes and summaries
function buildWordCloudText(interviews) {
    if (!Array.isArray(interviews)) return ''
    const parts = []
    for (const iv of interviews) {
        for (const q of (iv.analysis?.quotes ?? [])) {
            if (q.quoteText) parts.push(q.quoteText)
        }
        for (const s of (iv.analysis?.summaries ?? [])) {
            if (s.summaryText) parts.push(s.summaryText)
        }
    }
    return parts.join(' ')
}

// Compute Pearson correlation between two arrays
function pearsonCorrelation(x, y) {
    const n = x.length
    if (n === 0) return 0
    const mx = x.reduce((s, v) => s + v, 0) / n
    const my = y.reduce((s, v) => s + v, 0) / n
    let xy = 0, xx = 0, yy = 0
    for (let i = 0; i < n; i++) {
        xy += (x[i] - mx) * (y[i] - my)
        xx += (x[i] - mx) ** 2
        yy += (y[i] - my) ** 2
    }
    const denom = Math.sqrt(xx * yy)
    return denom === 0 ? 0 : xy / denom
}

// Pearson correlation of binary theme presence across interviews (phi coefficient).
// Measures how often two themes appear together vs. separately.
function buildThemeCorrelations(interviews) {
    if (!Array.isArray(interviews) || interviews.length < 2) return []

    const TOP_THEMES = 15 // Top 15 themes by frequency so that chart doesn't get too crowded
    const themeCounts = new Map()
    const interviewThemeSets = []

    for (const iv of interviews) {
        const set = new Set()
        for (const t of (iv.analysis?.themes ?? [])) {
            const title = String(t.title ?? '').trim()
            if (title){
                set.add(title)
                themeCounts.set(title, (themeCounts.get(title) || 0) + 1)
            }
        }
        interviewThemeSets.push(set)
    }

    const themesSorted = Array.from(themeCounts.entries())
        .filter(([, count]) => count >= 1)
        .sort((a, b) => b[1] - a[1])
        .slice(0, TOP_THEMES)
        .map(([title]) => title)
        .sort((a, b) => a.localeCompare(b))

    if (themesSorted.length < 2) return []

    const correlations = []
    for (const themeA of themesSorted) {
        for (const themeB of themesSorted) {
            let r
            if (themeA === themeB) {
                r = 1
            } else {
                const x = interviewThemeSets.map((s) => (s.has(themeA) ? 1 : 0))
                const y = interviewThemeSets.map((s) => (s.has(themeB) ? 1 : 0))
                r = pearsonCorrelation(x, y)
                if (Number.isNaN(r)) r = 0
            }
            correlations.push({ a: themeA, b: themeB, correlation: r })
        }
    }
    return correlations
}

// Build theme × identity counts for stacked bar chart.
// For every (theme, identity) pair that co-occur on an interview, increment a counter.
// Identity labels come from the LLM-extracted analysis.identities (canonical 15-label list).
function buildBarChartData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeIdentities = new Map()

    for (const iv of interviews) {
        const themes = iv.analysis?.themes ?? []
        const identityLabels = (iv.analysis?.identities ?? [])
            .map(i => i?.label)
            .filter(Boolean)

        if (identityLabels.length === 0) continue

        for (const t of themes) {
            if (!t.title) continue
            if (!themeIdentities.has(t.title)) {
                themeIdentities.set(t.title, {})
            }
            const identities = themeIdentities.get(t.title)
            for (const label of identityLabels) {
                identities[label] = (identities[label] || 0) + 1
            }
        }
    }

    return Array.from(themeIdentities.entries()).map(([theme, identities]) => ({
        theme,
        identities,
    }))
}

const INSIGHT_KEYS = {
    wordCloud: 'wordCloud',
    correlation: 'correlation',
    bubble: 'bubble',
    bar: 'bar',
    majorDoughnutChart: 'majorDoughnutChart',
}

function buildMajorDoughnutChartData(interviews) {
    if (!Array.isArray(interviews)) return []
    const majors = new Map()
    for (const iv of interviews) {
        const major = iv.demographics?.major
        if (major != null && String(major).trim()) {
            majors.set(major, (majors.get(major) || 0) + 1)
        }
    } return Array.from(majors.entries()).map(([major, count]) => ({
        major,
        count,
    }))
}

function insightCardProps(enabled, insightKey, setDialogKey) {
    if (!enabled) return {}
    return {
        role: 'button',
        tabIndex: 0,
        cursor: 'pointer',
        onClick: () => setDialogKey(insightKey),
        onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setDialogKey(insightKey)
            }
        },
    }
}

export default function Insights() {
    const { isReady, data, error, statusText } = useDataLoader()
    const [dialogKey, setDialogKey] = useState(null)

    const themes = useMemo(() => buildBubbleData(data?.interviews), [data?.interviews])
    const text = useMemo(() => buildWordCloudText(data?.interviews), [data?.interviews])
    const correlations = useMemo(() => buildThemeCorrelations(data?.interviews), [data?.interviews])
    const interviewData = useMemo(() => buildBarChartData(data?.interviews), [data?.interviews])
    const majorDoughnutChartData = useMemo(() => buildMajorDoughnutChartData(data?.interviews), [data?.interviews])

    const dialogMeta =
        dialogKey === INSIGHT_KEYS.wordCloud ? wordCloudMeta
        : dialogKey === INSIGHT_KEYS.correlation ? correlationHeatMapMeta
        : dialogKey === INSIGHT_KEYS.bubble ? bubbleChartMeta
        : dialogKey === INSIGHT_KEYS.bar ? barChartMeta
        : dialogKey === INSIGHT_KEYS.majorDoughnutChart ? majorDoughnutChartMeta
        : null

    if (!isReady) {
        return (
            <>
                <Heading>Insights</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) {
        return (
            <>
                <Heading>Insights</Heading>
                <Text color="red">Error: {error}</Text>
            </>
        )
    }

    return (
        <>
            <Heading mb={4}>Insights</Heading>
            <Text marginBottom='15px'>Click a data visualization for an expanded version and short description.</Text>
            <Grid
                templateColumns={{ base: "1fr", md: "1fr 1fr" }}
                templateRows={{ base: "repeat(4, 1fr)", md: "auto auto auto" }}
                gap={5}
                minH={{ base: "800px", md: "500px" }}
            >
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(!!text, INSIGHT_KEYS.wordCloud, setDialogKey)}
                >
                    {text ? <WordCloud text={text} interviews={data?.interviews} /> : <Text color="fg.muted">No interview text available.</Text>}
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="auto"
                    p={4}
                    {...insightCardProps(correlations.length > 0, INSIGHT_KEYS.correlation, setDialogKey)}
                >
                    {correlations.length > 0
                        ? <Correlation correlations={correlations} />
                        : <Text color="fg.muted">Not enough data for a correlation map (need at least two themes across interviews).</Text>
                    }
                </Box>
                <Box
                    display="flex"
                    flexDirection={{ base: "column", md: "row" }}
                    gap={5}
                    minH={0}
                    minW={0}
                    h={{ base: "auto", md: "300px" }}
                >
                    <Box
                        flex={{ md: "1 1 0" }}
                        minW={0}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="25px"
                        h={{ base: "300px", md: "100%" }}
                        minH={0}
                        overflow="hidden"
                        p={4}
                        {...insightCardProps(themes.length > 0, INSIGHT_KEYS.bubble, setDialogKey)}
                    >
                        {themes.length > 0 ? <BubbleChart data={themes} /> : <Text color="fg.muted">No theme data available.</Text>}
                    </Box>
                    <Box
                        flex={{ md: "1 1 0" }}
                        display="flex"
                        justifyContent="center"
                        minW={0}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="25px"
                        h={{ base: "300px", md: "100%" }}
                        minH={0}
                        overflow="hidden"
                        p={4}
                        {...insightCardProps(majorDoughnutChartData.length > 0, INSIGHT_KEYS.majorDoughnutChart, setDialogKey)}
                    >
                        {majorDoughnutChartData.length > 0 ? <MajorDoughnutChart majorData={majorDoughnutChartData} /> : <Text color="fg.muted">No major data available.</Text>}
                    </Box>
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    h='300px'
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(interviewData.length > 0, INSIGHT_KEYS.bar, setDialogKey)}
                >
                    {interviewData.length > 0
                        ? <BarChart interviewData={interviewData} />
                        : <Text color="fg.muted">No demographic data available.</Text>
                    }
                </Box>
            </Grid>

            <Dialog.Root
                open={dialogKey != null}
                onOpenChange={(e) => {
                    if (!e.open) setDialogKey(null)
                }}
                size="cover"
            >
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                        <Dialog.Content maxW="min(96vw, 1100px)" w="full" >
                            <Dialog.Header paddingBottom='0'>
                                <Dialog.Title>{dialogMeta?.title}</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body h='100%' overflow='auto'>
                                {dialogMeta && (
                                    <Text mb={4} fontSize="md">
                                        {dialogMeta.description}
                                    </Text>
                                )}
                                <Box w="full" minH={{ base: "320px", md: "420px" }} maxH="75vh" >
                                    {dialogKey === INSIGHT_KEYS.wordCloud && text ? (
                                        <WordCloud text={text} interviews={data?.interviews} width={960} height={540} />
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.correlation && correlations.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" >
                                            <Correlation correlations={correlations} plotWidth={960} />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.bubble && themes.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" minH="min(70vh, 900px)">
                                            <BubbleChart data={themes} width={880} height={880} />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.majorDoughnutChart && majorDoughnutChartData.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" minH="min(70vh, 900px)" >
                                            <MajorDoughnutChart majorData={majorDoughnutChartData} width={700} height={500} showLegend />
                                        </Box>
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.bar && interviewData.length > 0 ? (
                                        <Box w="100%" h="min(68vh, 720px)" minH="380px">
                                            <BarChart interviewData={interviewData} showLegend />
                                        </Box>
                                    ) : null}
                                </Box>
                            </Dialog.Body>
                        </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    )
}
