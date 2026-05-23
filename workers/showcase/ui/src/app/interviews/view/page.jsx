'use client'
import {
    Accordion,
    Box,
    Button,
    Carousel,
    Collapsible,
    Container,
    Heading,
    IconButton,
    List,
    Span,
    Stack,
    StackSeparator,
    Tabs,
    Text,
    useCarousel,
    useCollapsibleContext,
} from "@chakra-ui/react"
import { Suspense, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from "next/navigation"
import { useDataLoader } from '@/hooks/useDataLoader'
import { LuChevronLeft, LuChevronRight, LuClipboardList, LuCalendarDays, LuComponent, LuSquareCheck } from "react-icons/lu"
import { formatDate, capitalize } from '@/app/formatFunctions'
import BubbleChart from "@/components/visualizations/BubbleChart"
import Timeline from '@/components/visualizations/TimelineInterview'
import SentimentIndicator from '@/components/SentimentIndicator'


const DATE_OPTIONS = { year: 'numeric', month: 'long', day: 'numeric' }

function mapToUI(json) {
    if (!json || typeof json !== 'object') {
        return {
            intervieweeName: '',
            interviewDate: '',
            major: '',
            videoUrl: '/placeholder16x9.jpg',
            videoAlt: 'Interview',
            summaries: [],
            quotes: [],
            timelineData: [],
            themes: [],
            improvements: [],
            identities: [],
        }
    }

    const intervieweeName = json.title ?? 'Interviewee Name'
    const interviewDate = formatDate(json.metadata.interviewDate || '0', DATE_OPTIONS)
    const major = json.demographics.major || ''
    const videoUrl = `/assets/interview_repository/${json?.id}.mp4`
    const videoAlt = `${intervieweeName} interview` || 'Interview'

    const a = json.analysis ?? {}
    const summaries = (Array.isArray(a.summaries) ? a.summaries : []).map((s) => ({
        value: s.id,
        text: String(s.summaryText ?? ''),
        category: capitalize(String(s.category ?? '')),
        confidence: s.confidence
    }))
    const themes = (Array.isArray(a.themes) ? a.themes : []).map((t) => ({
        id: t.id,
        title: String(t.title ?? ''),
        description: String(t.description ?? ''),
        frequency: Number(t.frequency ?? 0) || 0,
        category: String(t.category ?? 'other'),
        relatedQuoteIds: Array.isArray(t.relatedQuoteIds) ? t.relatedQuoteIds : [],
    }))
    const quotes = (Array.isArray(a.quotes) ? a.quotes : []).map((q, i) => {
        const themeIds = (Array.isArray(q.themeIds) ? q.themeIds : []).filter(
            (id) => id != null && String(id).trim() !== ''
        )
        const themeTitles = themeIds
            .map((tid) => {
                const th = themes.find((t) => String(t.id) === String(tid))
                return th?.title ? th.title : String(tid)
            })
            .filter((label) => label.trim() !== '')
        return {
            id: q.id ?? String(i),
            text: String(q.quoteText ?? ''),
            context: String(q.context ?? ''),
            sentiment: String(q.sentiment ?? 'neutral'),
            significanceLevel: q.significanceLevel ? String(q.significanceLevel) : undefined,
            timelineEventId: q.timelineEventId ? String(q.timelineEventId) : undefined,
            tags: Array.isArray(q.tags) ? q.tags : [],
            themeIds,
            themeTitles,
        }
    })

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

    const timelineData = (Array.isArray(a.timeline) ? a.timeline : []).map((t) => {
        const period = capitalize(t.period ?? '')
        const linkedQuotes = quotes.filter((q) => q.timelineEventId && String(q.timelineEventId) === String(t.id))
        const linkedThemeIds = new Set()
        for (const lq of linkedQuotes) for (const tid of lq.themeIds) linkedThemeIds.add(String(tid))
        const linkedThemes = Array.from(linkedThemeIds)
            .map((tid) => themes.find((th) => String(th.id) === tid))
            .filter(Boolean)
        return {
            id: t.id,
            event: String(t.event ?? ''),
            period,
            significance: String(t.significance ?? ''),
            position: typeof t.position === 'number' ? t.position : undefined,
            term: t.term ? String(t.term) : undefined,
            linkedQuotes,
            linkedThemes,
            sentiment: aggregateSentiment(linkedQuotes),
            significanceLevel: maxSignificance(linkedQuotes),
        }
    })

    const identities = (Array.isArray(a.identities) ? a.identities : []).map((id) => ({
        label: String(id.label ?? ''),
        confidence: Number(id.confidence ?? 0) || 0,
        evidence: String(id.evidence ?? ''),
    }))
    const improvements = (Array.isArray(a.areasForImprovement) ? a.areasForImprovement : []).map((improvement) => ({
        id: improvement.id,
        area: String(improvement.area ?? ''),
        description: String(improvement.description ?? ''),
        category: String(improvement.category ?? 'other'),
        priority: String(improvement.priority ?? 'medium'),
        stakeholders: Array.isArray(improvement.stakeholders) ? improvement.stakeholders : [],
    }))

    return {
        intervieweeName,
        interviewDate,
        major,
        videoUrl,
        videoAlt,
        summaries,
        timelineData,
        themes,
        quotes,
        improvements,
        identities,
    }
}

// allows long quotes to be expanded and collapsed
function QuotePreviewText({ children, ...props }) {
    const { open } = useCollapsibleContext()
    return (
        <Text
            fontWeight="medium"
            fontSize="lg"
            textAlign="center"
            {...props}
            lineClamp={open ? undefined : 3}
        >
            {children}
        </Text>
    )
}

function InterviewViewInner() {
    const searchParams = useSearchParams()
    const interviewId = searchParams.get('id')
    const { statusText, error, isReady, data } = useDataLoader()
    const router = useRouter()

    const interview = useMemo(() => {
        const list = data?.interviews
        if (!Array.isArray(list) || !interviewId) return null
        return list.find((iv) => (iv.interviewId ?? iv.id) === interviewId) ?? null
    }, [data?.interviews, interviewId])

    const dataForUI = useMemo(() => (interview ? mapToUI(interview) : null), [interview])

    useEffect(() => {
        if (!dataForUI?.intervieweeName) return
        document.title = `${dataForUI.intervieweeName} Interview | SESAP`
    }, [dataForUI?.intervieweeName])

    const improvementsByPriority = useMemo(() => {
        if (!dataForUI?.improvements?.length) return []
        const level = ['high', 'medium', 'low']
        const grouped = new Map()
        for (const p of level) grouped.set(p, [])
        grouped.set('_other', [])
        for (const item of dataForUI.improvements) {
            const p = (item.priority || 'medium').toLowerCase()
            if (grouped.has(p)) grouped.get(p).push(item)
            else grouped.get('_other').push(item)
        }
        return level
            .concat('_other')
            .map((p) => ({ priority: p === '_other' ? 'other' : p, items: grouped.get(p) || [] }))
            .filter((g) => g.items.length > 0)
    }, [dataForUI?.improvements])

    const carousel = useCarousel({ slideCount: dataForUI?.quotes?.length ?? 1, loop: true })

    if (!interviewId) return <Text color="red">No interview ID specified.</Text>

    if (!isReady) {
        return (
            <>
                <Box mb={4}>
                    <Button variant="outline" onClick={() => router.back()}>← Back</Button>
                </Box>
                <Text>Loading… {statusText}</Text>
                {error != null && <Text color="red">Error: {error}</Text>}
            </>
        )
    }
    if (error) return <Text color="red">Error: {error}</Text>
    if (!interview) {
        return (
            <>
                <Box mb={4}>
                    <Button variant="outline" onClick={() => router.back()}>← Back</Button>
                </Box>
                <Text color="red">Interview not found.</Text>
            </>
        )
    }
    if (!dataForUI) return null

    const { intervieweeName, interviewDate, major, videoUrl, videoAlt, summaries, timelineData, themes, quotes, improvements, identities } = dataForUI

    return (
        <>
            <Box mb={4}>
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                <Container w='50%'>
                        <Box
                            as="video"
                            src={videoUrl}
                            type="video/mp4"
                            controls
                            poster='/thumbnail.png'
                            preload="metadata"
                            width="100%"
                            maxH="100%"
                            maxW="100%"
                            margin="10px"
                        />
                    <Text fontSize='2xl' fontWeight='bold' marginLeft='10px'>{intervieweeName || '—'}</Text>
                    <Text marginLeft='10px'>{interviewDate || '—'}{major ? ` | ${major}` : ''}</Text>
                </Container>

                <Container w='50%'>
                    <Tabs.Root fitted lazyMount defaultValue="overview">
                        <Tabs.List>
                            <Tabs.Trigger value="overview">
                                <LuClipboardList />
                                Overview
                            </Tabs.Trigger>
                            <Tabs.Trigger value="timeline">
                                <LuCalendarDays />
                                Timeline
                            </Tabs.Trigger>
                            <Tabs.Trigger value="themes">
                                <LuComponent />
                                Themes
                            </Tabs.Trigger>
                            <Tabs.Trigger value="improvements">
                                <LuSquareCheck />
                                Improvements
                            </Tabs.Trigger>
                        </Tabs.List>

                        {/* Overview */}
                        <Tabs.Content value="overview">
                            <Heading>Key Summaries</Heading>
                            <Accordion.Root multiple >
                                {summaries.map((item, index) => (
                                    <Accordion.Item key={index} value={item.value}>
                                        <Accordion.ItemTrigger>
                                            <Span flex="1" textTransform="capitalize">{item.category}</Span>
                                            <Accordion.ItemIndicator />
                                        </Accordion.ItemTrigger>
                                        <Accordion.ItemContent>
                                            <Accordion.ItemBody>{item.text}</Accordion.ItemBody>
                                        </Accordion.ItemContent>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>

                            {/* Quotes */}
                            <Carousel.RootProvider value={carousel}>
                                <Collapsible.Root collapsedHeight="150px">
                                    <Stack direction="row" justifyContent="space-between" marginBottom='10px' marginTop='10px'>
                                        <Heading>Notable Quotes</Heading>
                                        <Collapsible.Trigger asChild mt="4">
                                            <Button
                                                variant="surface"
                                                size="sm"
                                                width="75px"
                                                colorPalette='gray'
                                                aria-label="Show full quote and details"
                                            >
                                                Expand
                                            </Button>
                                        </Collapsible.Trigger>
                                    </Stack>
                                    
                                    <Collapsible.Content borderRadius='25px'>
                                        <Carousel.ItemGroup>
                                            {quotes.map((item, index) => (
                                                <Carousel.Item key={index} index={index}>
                                                    <Box
                                                        w="100%"
                                                        minH="150px"
                                                        h='fit-content'
                                                        borderRadius='25px'
                                                        bg='white'
                                                        display='flex'
                                                        flexDirection='column'
                                                    >
                                                        <Box
                                                            minH='150px'
                                                            display='flex'
                                                            flexDirection='column'
                                                        >
                                                            <Box
                                                                flexShrink={0}
                                                                display='flex'
                                                                justifyContent='flex-end'
                                                                alignItems='center'
                                                                px='15px'
                                                                pt='12px'
                                                                pb='4px'
                                                            >
                                                                <SentimentIndicator sentiment={item.sentiment}/>
                                                            </Box>
                                                            <Box px='15px' pb='15px'>
                                                                <QuotePreviewText w='100%'>
                                                                    "{item.text}"
                                                                </QuotePreviewText>
                                                            </Box>
                                                        </Box>
                                                        <Box p='15px' paddingTop='0'>
                                                            <List.Root ps='5'>
                                                                <List.Item>
                                                                    <strong>Context:</strong> {item.context}
                                                                </List.Item>
                                                                <List.Item>
                                                                    <strong>Sentiment:</strong> {item.sentiment}
                                                                </List.Item>
                                                                {item.themeTitles.length > 0 ? (
                                                                    <List.Item>
                                                                        <strong>Themes:</strong>{' '}
                                                                        {item.themeTitles.join(', ')}
                                                                    </List.Item>
                                                                ) : null}
                                                                <List.Item>
                                                                    <strong>Tags:</strong>{' '}
                                                                    {item.tags.length ? item.tags.join(', ') : ''}
                                                                </List.Item>
                                                            </List.Root>
                                                        </Box>
                                                    </Box>
                                                </Carousel.Item>
                                            ))}
                                        </Carousel.ItemGroup>
                                    </Collapsible.Content>
                                </Collapsible.Root>

                                <Carousel.Control justifyContent="center" gap="4">
                                    <Carousel.PrevTrigger asChild>
                                        <IconButton size="xs" variant="ghost">
                                            <LuChevronLeft />
                                        </IconButton>
                                    </Carousel.PrevTrigger>

                                    <Carousel.Indicators 
                                        bg="gray.400" 
                                        boxSize="3"
                                        _current={{ width: "10", bg: "gray.600", opacity: 1 }}
                                    />

                                    <Carousel.NextTrigger asChild>
                                        <IconButton size="xs" variant="ghost">
                                            <LuChevronRight />
                                        </IconButton>
                                    </Carousel.NextTrigger>
                                </Carousel.Control>
                            </Carousel.RootProvider>

                            {identities && identities.length > 0 ? (
                                <>
                                    <Heading>Associated Identities</Heading>
                                    <Box display="flex" flexWrap="wrap" gap="2">
                                        {identities.map((id, i) => (
                                            <Box
                                                key={`${id.label}-${i}`}
                                                px="3"
                                                py="1"
                                                borderRadius="full"
                                                bg="gray.100"
                                                fontSize="sm"
                                            >
                                                {id.label.replace(/_/g, ' ')}
                                            </Box>
                                        ))}
                                    </Box>
                                </>
                            ) : null}
                        </Tabs.Content>

                        {/* Timeline */}
                        <Tabs.Content value="timeline">
                            <Timeline data={timelineData} showEventLabels={false}/>
                            <Accordion.Root collapsible variant='enclosed'>
                                <Accordion.Item>
                                    <Accordion.ItemTrigger>
                                        <Span flex="1">Events</Span>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent>
                                        <Accordion.ItemBody>
                                            <List.Root ps='5'>
                                                {timelineData.map((item, index) => (
                                                    <List.Item key={index}>
                                                        <strong>{item.period}:</strong> {item.event}
                                                    </List.Item>
                                                ))}
                                            </List.Root>
                                        </Accordion.ItemBody>
                                    </Accordion.ItemContent>
                                </Accordion.Item>
                            </Accordion.Root>
                        </Tabs.Content>

                        {/* Themes */}
                        <Tabs.Content value="themes">
                            <Box width='100%' >
                                <BubbleChart data={themes} width='600' height='400' />
                            </Box>
                            <Accordion.Root collapsible variant='enclosed'>
                                <Accordion.Item>
                                    <Accordion.ItemTrigger>
                                        <Span flex="1">Themes</Span>
                                        <Accordion.ItemIndicator />
                                    </Accordion.ItemTrigger>
                                    <Accordion.ItemContent>
                                        <Accordion.ItemBody>
                                            <List.Root ps='5'>
                                                {themes.map((item, index) => (
                                                    <List.Item key={index}>
                                                        <strong>{item.title}:</strong> {item.frequency}
                                                    </List.Item>
                                                ))}
                                            </List.Root>
                                        </Accordion.ItemBody>
                                    </Accordion.ItemContent>
                                </Accordion.Item>
                            </Accordion.Root>
                        </Tabs.Content>

                        {/* Improvements */}
                        <Tabs.Content value="improvements">
                            <Accordion.Root multiple defaultValue={["high"]}>
                                {improvementsByPriority.map(({ priority, items }) => (
                                    <Accordion.Item key={priority} value={priority}>
                                        <Accordion.ItemTrigger>
                                            <Span flex="1" textTransform="capitalize"><Heading m='0'>{priority}</Heading></Span>
                                            <Accordion.ItemIndicator />
                                        </Accordion.ItemTrigger>
                                        <Accordion.ItemContent>
                                            <Accordion.ItemBody>
                                                <List.Root ps="5">
                                                    {items.map((item, index) => (
                                                        <List.Item key={item.id ?? index}>
                                                            <Text as="span"><Text as="strong" fontWeight="bold">{item.area}</Text>: {item.description || '—'}</Text>
                                                        </List.Item>
                                                    ))}
                                                </List.Root>
                                            </Accordion.ItemBody>
                                        </Accordion.ItemContent>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>
                        </Tabs.Content>
                    </Tabs.Root>
                </Container>
            </Stack>
        </>
    )
}

export default function Page() {
    return (
        <Suspense fallback={<Text>Loading...</Text>}>
            <InterviewViewInner />
        </Suspense>
    )
}
