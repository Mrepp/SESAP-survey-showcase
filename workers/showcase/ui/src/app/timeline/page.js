'use client'
import { Heading, Text } from "@chakra-ui/react"
import { useMemo } from "react"
import { useDataLoader } from '@/hooks/useDataLoader'
import Timeline from '@/components/visualizations/TimelineInterview'

const SIGNIFICANCE_RANK = { high: 3, medium: 2, low: 1 }
const SENTIMENT_BY_PRIORITY = ['mixed', 'negative', 'positive', 'neutral']

function aggregateSentiment(qs) {
    if (!qs.length) return 'neutral'
    const counts = qs.reduce((acc, q) => {
        const s = q.sentiment || 'neutral'
        acc[s] = (acc[s] ?? 0) + 1
        return acc
    }, {})
    if (counts.positive && counts.negative) return 'mixed'
    for (const s of SENTIMENT_BY_PRIORITY) if (counts[s]) return s
    return 'neutral'
}

function maxSignificance(qs) {
    let best = null
    let bestRank = 0
    for (const q of qs) {
        const r = SIGNIFICANCE_RANK[q.significanceLevel] ?? 0
        if (r > bestRank) { bestRank = r; best = q.significanceLevel }
    }
    return best
}

function formatPeriod(periodRaw) {
    if (typeof periodRaw !== 'string') return String(periodRaw ?? '')
    return periodRaw
        .split(' ')
        .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
        .join(' ')
}

// Aggregate timeline events across all interviews into a single TimelinePoint[]
// (matches the per-interview Timeline data shape so we can reuse the same component).
function buildAggregateTimeline(interviews) {
    if (!Array.isArray(interviews)) return []
    const out = []

    for (const iv of interviews) {
        const a = iv?.analysis ?? {}
        const events = Array.isArray(a.timeline) ? a.timeline : []
        const quotes = Array.isArray(a.quotes) ? a.quotes : []
        const themes = Array.isArray(a.themes) ? a.themes : []
        const intervieweeName = iv?.title ?? ''

        for (const t of events) {
            const linkedQuotes = quotes
                .filter((q) => q.timelineEventId && String(q.timelineEventId) === String(t.id))
                .map((q) => ({
                    id: q.id,
                    text: String(q.quoteText ?? ''),
                    context: intervieweeName
                        ? `${intervieweeName}${q.context ? ` · ${q.context}` : ''}`
                        : String(q.context ?? ''),
                    sentiment: String(q.sentiment ?? 'neutral'),
                    significanceLevel: q.significanceLevel ? String(q.significanceLevel) : undefined,
                    themeIds: Array.isArray(q.themeIds) ? q.themeIds.map(String) : [],
                }))

            const linkedThemeIds = new Set()
            for (const lq of linkedQuotes) for (const tid of lq.themeIds) linkedThemeIds.add(tid)
            const linkedThemes = Array.from(linkedThemeIds)
                .map((tid) => themes.find((th) => String(th.id) === tid))
                .filter(Boolean)
                .map((th) => ({ id: th.id, title: String(th.title ?? '') }))

            out.push({
                id: `${iv?.id ?? 'iv'}::${t.id}`,
                event: String(t.event ?? ''),
                period: formatPeriod(t.period ?? ''),
                significance: String(t.significance ?? ''),
                position: typeof t.position === 'number' ? t.position : undefined,
                term: t.term ? String(t.term) : undefined,
                interviewId: iv?.id,
                intervieweeName,
                linkedQuotes,
                linkedThemes,
                sentiment: aggregateSentiment(linkedQuotes),
                significanceLevel: maxSignificance(linkedQuotes),
            })
        }
    }

    return out
}

export default function TimelinePage() {
    const { isReady, data, error, statusText } = useDataLoader()
    const events = useMemo(() => buildAggregateTimeline(data?.interviews), [data?.interviews])

    if (!isReady) {
        return (
            <>
                <Heading>Timeline</Heading>
                <Text>{statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) {
        return (
            <>
                <Heading>Timeline</Heading>
                <Text color="red">Error: {error}</Text>
            </>
        )
    }

    return (
        <>
            <Heading mb={2}>Timeline</Heading>
            <Text marginBottom="15px">
                Pivotal events drawn from every interview, plotted against the academic
                timeline from pre-college through post-college. Marker rings encode
                sentiment; size reflects the significance of the anchored quote.
            </Text>
            {events.length > 0 ? (
                <Timeline data={events} />
            ) : (
                <Text color="fg.muted">No timeline events available.</Text>
            )}
        </>
    )
}
