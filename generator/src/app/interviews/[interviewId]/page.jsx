'use client'
import {
    Accordion,
    Badge,
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
import { use, useEffect, useState } from 'react'
import { useRouter } from "next/navigation"
import { LuChevronLeft, LuChevronRight, LuClipboardList, LuCalendarDays, LuSquareCheck } from "react-icons/lu"
import BubbleChart from "@/components/visualizations/BubbleChart"
import Timeline from '@/components/visualizations/Timeline'
import SentimentIndicator from '@/components/SentimentIndicator'

function mapToUI(json) {
    // Date formatting options
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
    }

    // Overview data
    const intervieweeName = json.intervieweeName || ''
    const interviewDate = json.interviewDate
        ? new Date(json.interviewDate).toLocaleDateString(undefined, options)
        : ''

    // Analysis
    const a = json?.analysis || {}
    const summaries = (a.summaries || []).map((s, i) => ({
        value: s.id || String(i),
        title: (s.category || 'Summary').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        text: s.summaryText || ''
    }))
    const quotes = (a.quotes || []).map((q, i) => ({
        value: q.id || String(i),
        text: q.quoteText || '',
        sentiment: (q.sentiment || 'neutral').toLowerCase()
    }))
    const timelineData = (a.timeline || []).map((t, i) => ({
        year: 2019 + i,
        event: t.event || '',
        period: t.period
            .split(" ")
            .map(([ firstLetter, ...otherLetters ]) => `${firstLetter.toUpperCase()}${otherLetters.join("")}`)
            .join(" ")
    }))
    const themes = (a.themes || []).map((t) => ({
        title: t.title || '',
        impactScore: t.frequency ?? 0,
        category: t.category || 'other'
    }))
    const improvements = (a.areasForImprovement || []).map((area, i) => ({
        value: area.id || String(i),
        title: area.area || '',
        text: area.description ? [area.description] : [],
        stakeholders: []
    }))
    
    return { intervieweeName, interviewDate, summaries, quotes, timelineData, themes, improvements }
}

export default function Template({ params }) {
    const { interviewId } = use(params)
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        async function load() {
            try {
                setLoading(true)
                setError(null)
                const res = await fetch(`/api/interviews/${encodeURIComponent(interviewId)}`)
                if (!res.ok) {
                    const err = await res.json().catch(() => ({}))
                    throw new Error(err.error || `Failed to load interview: ${res.status}`)
                }
                const json = await res.json()
                if (!cancelled) setData(mapToUI(json))
            } catch (e) {
                if (!cancelled) setError(e.message)
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        load()
        return () => { cancelled = true }
    }, [interviewId])

    const carousel = useCarousel({ slideCount: data?.quotes?.length ?? 1, loop: true }) // I don't know why the carousel needs a hook and nothing else does
    const router = useRouter()

    if (loading) return <Text>Loading interview…</Text>
    if (error) return <Text color="red">Error: {error}</Text>
    if (!data) return null

    const { intervieweeName, interviewDate, summaries, quotes, timelineData, themes, improvements } = data

    return (
        <>
            <Box mb={4}>
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
            </Box>
            
            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                {/* Interview */}
                <Container w='50%'>
                    <Image src="/placeholder16x9.jpg" alt="placeholder" maxH="100%" maxW="100%" margin='10px' />
                    <Text fontSize='2xl' fontWeight='bold' marginLeft='10px'>{intervieweeName}</Text>
                    <Text marginLeft='10px'>{interviewDate || '—'}</Text>
                </Container>

                {/* Interview Data */}
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
                                            <Span flex="1">{item.title}</Span>
                                            <Accordion.ItemIndicator />
                                        </Accordion.ItemTrigger>
                                        <Accordion.ItemContent>
                                            <Accordion.ItemBody>{item.text}</Accordion.ItemBody>
                                        </Accordion.ItemContent>
                                    </Accordion.Item>
                                ))}
                            </Accordion.Root>

                            <Heading>Notable Quotes</Heading>
                            <Carousel.RootProvider value={carousel} >
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
                            
                            <List.Root ps='5' >
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
                            
                            <List.Root ps='5' >
                                {themes.map((item, index) => (
                                    <List.Item key={index}>
                                        <strong>{item.title}:</strong> {item.impactScore}
                                    </List.Item>
                                ))}
                            </List.Root>
                        </Tabs.Content>

                        {/* Improvements */}
                        <Tabs.Content value="improvements">
                            stakeholder tags on improvement areas

                            <Accordion.Root multiple defaultValue={["high"]}>
                                {improvements.map((item, index) => (
                                    <Accordion.Item key={index} value={item.value}>
                                        <Accordion.ItemTrigger>
                                            <Span flex="1">{item.title}</Span>
                                            <Accordion.ItemIndicator />
                                        </Accordion.ItemTrigger>
                                        <Accordion.ItemContent>
                                            <Accordion.ItemBody>
                                                <List.Root ps='5' >
                                                    {item.text.map((item, index) => (
                                                        <List.Item key={index}>
                                                            {item}
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