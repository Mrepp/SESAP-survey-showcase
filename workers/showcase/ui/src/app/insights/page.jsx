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
import WordCloud, { wordCloudMeta } from "@/components/visualizations/WordCloud"

function splitThemeTitle(title) {
    return title
        .split(/\s*&\s*|\s+and\s+/i)
        .map(t => t.replace(/\d+$/, '').trim())
        .filter(Boolean)
}

// Aggregate themes across all interviews for BubbleChart
function buildBubbleData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeMap = new Map()
    for (const iv of interviews) {
        for (const t of (iv.analysis?.themes ?? [])) {
            if (!t.title) continue
            const titles = splitThemeTitle(t.title)
            for (const title of titles) {
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

// Compute correlations between per-interview analysis feature counts
function buildCorrelations(interviews) {
    if (!Array.isArray(interviews) || interviews.length < 3) return []

    const features = interviews.map(iv => {
        const a = iv.analysis ?? {}
        return {
            Themes: (a.themes ?? []).length,
            Quotes: (a.quotes ?? []).length,
            Improvements: (a.areasForImprovement ?? []).length,
            Summaries: (a.summaries ?? []).length,
            Timeline: (a.timeline ?? []).length,
        }
    })

    const fields = Object.keys(features[0])
    const correlations = []

    for (const a of fields) {
        for (const b of fields) {
            const xVals = features.map(f => f[a])
            const yVals = features.map(f => f[b])
            correlations.push({ a, b, correlation: pearsonCorrelation(xVals, yVals) })
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
    const correlations = useMemo(() => buildCorrelations(data?.interviews), [data?.interviews])
    const interviewData = useMemo(() => buildBarChartData(data?.interviews), [data?.interviews])

    const dialogMeta =
        dialogKey === INSIGHT_KEYS.wordCloud ? wordCloudMeta
        : dialogKey === INSIGHT_KEYS.correlation ? correlationHeatMapMeta
        : dialogKey === INSIGHT_KEYS.bubble ? bubbleChartMeta
        : dialogKey === INSIGHT_KEYS.bar ? barChartMeta
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
                templateRows={{ base: "repeat(4, 1fr)", md: "1fr 1fr" }}
                gap={5}
                h={{ base: "auto", md: "calc(100vh - 100px)" }}
                minH={{ base: "800px", md: "500px" }}
            >
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
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
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(correlations.length > 0, INSIGHT_KEYS.correlation, setDialogKey)}
                >
                    {correlations.length > 0
                        ? <Correlation correlations={correlations} />
                        : <Text color="fg.muted">Not enough interview data for correlations (need at least 3).</Text>
                    }
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
                    minH={0}
                    overflow="hidden"
                    p={4}
                    {...insightCardProps(themes.length > 0, INSIGHT_KEYS.bubble, setDialogKey)}
                >
                    {themes.length > 0 ? <BubbleChart data={themes} /> : <Text color="fg.muted">No theme data available.</Text>}
                </Box>
                <Box
                    bg="white"
                    borderWidth="1px"
                    borderRadius="25px"
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
                        <Dialog.Content maxW="min(96vw, 1100px)" w="full">
                            <Dialog.Header paddingBottom='0'>
                                <Dialog.Title>{dialogMeta?.title}</Dialog.Title>
                                <Dialog.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Dialog.CloseTrigger>
                            </Dialog.Header>
                            <Dialog.Body>
                                {dialogMeta && (
                                    <Text mb={4} fontSize="md">
                                        {dialogMeta.description}
                                    </Text>
                                )}
                                <Box w="full" minH={{ base: "320px", md: "420px" }} maxH="75vh" overflow="auto">
                                    {dialogKey === INSIGHT_KEYS.wordCloud && text ? (
                                        <WordCloud text={text} interviews={data?.interviews} width={960} height={540} />
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.correlation && correlations.length > 0 ? (
                                        <Correlation correlations={correlations} plotWidth={960} />
                                    ) : null}
                                    {dialogKey === INSIGHT_KEYS.bubble && themes.length > 0 ? (
                                        <Box display="flex" justifyContent="center" alignItems="center" minH="min(70vh, 900px)">
                                            <BubbleChart data={themes} width={880} height={880} />
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
