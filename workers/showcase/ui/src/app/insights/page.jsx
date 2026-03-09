'use client'
import {
    Box,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react"
import { useMemo } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import BarChart from '@/components/visualizations/BarChart'
import BubbleChart from "@/components/visualizations/BubbleChart"
import Correlation from '@/components/visualizations/CorrelationHeatMap'
import WordCloud from "@/components/visualizations/WordCloud"

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

// Build theme-by-demographic data for stacked bar chart
function buildBarChartData(interviews) {
    if (!Array.isArray(interviews)) return []
    const themeIdentities = new Map()

    for (const iv of interviews) {
        const demographics = iv.demographics ?? {}
        const themes = iv.analysis?.themes ?? []

        // Collect non-empty demographic values as identity labels
        const identityLabels = []
        for (const [, value] of Object.entries(demographics)) {
            if (value && typeof value === 'string') {
                identityLabels.push(value)
            }
        }

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

export default function Insights() {
    const { isReady, data, error, statusText } = useDataLoader()

    const themes = useMemo(() => buildBubbleData(data?.interviews), [data?.interviews])
    const text = useMemo(() => buildWordCloudText(data?.interviews), [data?.interviews])
    const correlations = useMemo(() => buildCorrelations(data?.interviews), [data?.interviews])
    const interviewData = useMemo(() => buildBarChartData(data?.interviews), [data?.interviews])

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
            <Stack direction={{ base: "column", md: "row" }} h='100vh' gap='20px'>
                <Stack w='40%' h='100%' gap='20px'>
                    <Box bg='white' w='100%' borderWidth="1px" borderRadius='25px'>
                        {text ? <WordCloud text={text} /> : <Text p={4} color="fg.muted">No interview text available.</Text>}
                    </Box>

                    <Box bg='white' borderWidth="1px" borderRadius='25px' p='15px'>
                        {themes.length > 0 ? <BubbleChart data={themes}/> : <Text color="fg.muted">No theme data available.</Text>}
                    </Box>
                </Stack>

                <Stack h='100%' gap='20px'>
                    <Box w='fit-content' h='fit-content' bg='white' borderWidth="1px" borderRadius='25px' paddingLeft='20px' paddingTop='20px' paddingBottom='20px'>
                        {correlations.length > 0
                            ? <Correlation correlations={correlations}/>
                            : <Text color="fg.muted" p={4}>Not enough interview data for correlations (need at least 3).</Text>
                        }
                    </Box>

                    <Box minH='300px' h='fit-content' bg='white' padding='20px' borderWidth="1px" borderRadius='25px'>
                        {interviewData.length > 0
                            ? <BarChart interviewData={interviewData}/>
                            : <Text color="fg.muted">No demographic data available.</Text>
                        }
                    </Box>
                </Stack>
            </Stack>
        </>
    )
}
