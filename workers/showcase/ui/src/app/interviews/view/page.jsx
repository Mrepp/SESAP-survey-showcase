'use client'
import {
    Accordion,
    Box,
    Button,
    Carousel,
    Container,
    Heading,
    IconButton,
    Image,
    List,
    Span,
    Stack,
    StackSeparator,
    Tabs,
    Text,
    useCarousel
} from "@chakra-ui/react"
import { Suspense, useMemo } from 'react'
import { useSearchParams, useRouter } from "next/navigation"
import { useDataLoader } from '@/hooks/useDataLoader'
import { LuChevronLeft, LuChevronRight, LuClipboardList, LuCalendarDays, LuSquareCheck } from "react-icons/lu"
import BubbleChart from "@/components/visualizations/BubbleChart"
import Timeline from '@/components/visualizations/Timeline'
import SentimentIndicator from '@/components/SentimentIndicator'

const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

function formatDate(value) {
    if (value == null) return ''
    const d = typeof value === 'string' ? new Date(value) : value
    return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, dateOptions)
}

function mapToUI(json) {
    if (!json || typeof json !== 'object') {
        return {
            intervieweeName: '',
            interviewDate: '',
            videoUrl: '/placeholder16x9.jpg',
            videoAlt: 'Interview',
            summaries: [],
            quotes: [],
            timelineData: [],
            themes: [],
            improvements: [],
        }
    }

    const intervieweeName = json.title ?? 'Interviewee Name'
    const interviewDate = formatDate(json.metadata.interviewDate || '0')
    const videoUrl = json.videoUrl ?? '/placeholder16x9.jpg'
    const videoAlt = `${intervieweeName} interview` || 'Interview'

    const a = json.analysis ?? {}
    const summaries = (Array.isArray(a.summaries) ? a.summaries : []).map((s) => ({
        value: s.id,
        title: String(s.title ?? 'Summary').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        text: String(s.summaryText ?? ''),
        category: String(s.category ?? '').replace(/_-/g, ' '),
        confidence: s.confidence
    }))
    const timelineData = (Array.isArray(a.timeline) ? a.timeline : []).map((t) => {
        const periodRaw = t.period ?? ''
        const period = typeof periodRaw === 'string'
            ? periodRaw.split(' ').map((word) => {
                if (!word) return word
                const first = word[0]
                const rest = word.slice(1)
                return first.toUpperCase() + rest
              }).join(' ')
            : String(periodRaw)
        return {
            id: t.id,
            event: String(t.event ?? ''),
            period,
            significance: String(t.significance ?? ''),
        }
    })
    const themes = (Array.isArray(a.themes) ? a.themes : []).map((t) => ({
        id: t.id,
        title: String(t.title ?? ''),
        description: String(t.description ?? ''),
        frequency: Number(t.frequency ?? 0) || 0,
        category: String(t.category ?? 'other'),
        relatedQuoteIds: Array.isArray(t.relatedQuoteIds) ? t.relatedQuoteIds : [],
    }))
    const quotes = (Array.isArray(a.quotes) ? a.quotes : []).map((q, i) => ({
        id: q.id ?? String(i),
        text: String(q.quoteText ?? ''),
        context: String(q.context ?? ''),
        sentiment: String(q.sentiment ?? 'neutral'),
        tags: Array.isArray(q.tags) ? q.tags : [],
        themeIds: Array.isArray(q.themeIds) ? q.themeIds : [],
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
        videoUrl,
        videoAlt,
        summaries,
        timelineData,
        themes,
        quotes,
        improvements,
    }
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

    const { intervieweeName, interviewDate, videoUrl, videoAlt, summaries, timelineData, themes, quotes, improvements } = dataForUI

    return (
        <>
            <Box mb={4}>
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                <Container w='50%'>
                    <Image src={videoUrl} alt={videoAlt} maxH="100%" maxW="100%" margin='10px' />
                    <Text fontSize='2xl' fontWeight='bold' marginLeft='10px'>{intervieweeName || '—'}</Text>
                    <Text marginLeft='10px'>{interviewDate || '—'}</Text>
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
                                <LuCalendarDays />
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
                            <Accordion.Root multiple>
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

                            <Heading>Notable Quotes</Heading>
                            <Carousel.RootProvider value={carousel}>
                                <Carousel.ItemGroup>
                                    {quotes.map((item, index) => (
                                    <Carousel.Item key={index} index={index}>
                                        <Box
                                            w="100%"
                                            minH="150px"
                                            h='fit-content'
                                            p='15px'
                                            borderRadius='25px'
                                            bg='white'
                                            position='relative'
                                            display='flex'
                                            flexDirection='column'
                                            justifyContent='center'
                                            alignItems='center'
                                            textAlign='center'
                                        >
                                            <Box position='absolute' top='15px' right='15px'>
                                                <SentimentIndicator sentiment={item.sentiment}/>
                                            </Box>
                                            <Text fontWeight='medium' fontSize='lg'>
                                                "{item.text}"
                                            </Text>
                                        </Box>
                                    </Carousel.Item>
                                    ))}
                                </Carousel.ItemGroup>

                                <Carousel.Control justifyContent="center" gap="4">
                                    <Carousel.PrevTrigger asChild>
                                        <IconButton size="xs" variant="ghost">
                                            <LuChevronLeft />
                                        </IconButton>
                                    </Carousel.PrevTrigger>

                                    <Carousel.Indicators />

                                    <Carousel.NextTrigger asChild>
                                        <IconButton size="xs" variant="ghost">
                                            <LuChevronRight />
                                        </IconButton>
                                    </Carousel.NextTrigger>
                                </Carousel.Control>
                            </Carousel.RootProvider>
                        </Tabs.Content>

                        {/* Timeline */}
                        <Tabs.Content value="timeline">
                            <Timeline data={timelineData}/>
                            <List.Root ps='5'>
                                {timelineData.map((item, index) => (
                                    <List.Item key={index}>
                                        <strong>{item.period}:</strong> {item.event}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Tabs.Content>

                        {/* Themes */}
                        <Tabs.Content value="themes">
                            <Box bg='white' width='fit-content' borderRadius='50%'>
                                <BubbleChart data={themes} width={400} />
                            </Box>
                            <List.Root ps='5'>
                                {themes.map((item, index) => (
                                    <List.Item key={index}>
                                        <strong>{item.title}:</strong> {item.impactScore}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Tabs.Content>

                        {/* Improvements */}
                        <Tabs.Content value="improvements">
                            <Accordion.Root multiple defaultValue={["high"]}>
                                {improvementsByPriority.map(({ priority, items }) => (
                                    <Accordion.Item key={priority} value={priority}>
                                        <Accordion.ItemTrigger>
                                            <Span flex="1" textTransform="capitalize">{priority}</Span>
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
