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
import { useRouter } from "next/navigation"
import { LuChevronLeft, LuChevronRight, LuClipboardList, LuCalendarDays, LuSquareCheck } from "react-icons/lu"
import BubbleChart from "@/components/visualizations/BubbleChart"
import Timeline from '@/components/visualizations/Timeline'
import SentimentIndicator from '@/components/SentimentIndicator'


export default function Template() {
    const carousel = useCarousel({ slideCount: quotes.length })
    const router = useRouter()

    return (
        <>
            <Box mb={4}>
                <Button variant="outline" onClick={() => router.back()}>
                    ← Back
                </Button>
            </Box>
            
            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                {/* Interview */}
                <Container>
                    <Image src="/placeholder16x9.jpg" alt="placeholder" maxH="100%" maxW="100%" margin='10px' />
                    <Text fontSize='2xl' fontWeight='bold' marginLeft='10px'>{intervieweeName}</Text>
                    <Text marginLeft='10px'>{interviewDate}</Text>
                </Container>

                {/* Interview Data */}
                <Container>
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
                            
                            <List.Root ps='5' >
                                {timelineData.map((item, index) => (
                                    <List.Item key={index}>
                                        <strong>{item.year}:</strong> {item.event}
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

const intervieweeName = "Firstname Lastname"
const interviewDate = '2023-03-31'

// overview
const summaries = [
    { value: "diversity", title: "Diversity", text: "Some value 1..." },
    { value: "campusLife", title: "Campus Life", text: "Some value 2..." },
    { value: "career", title: "Career", text: "Some value 2..." },
]

// quotes
const quotes = [
    { value: "0", text: "In a hole in the ground there lived a hobbit.", sentiment: 'positive'},
    { value: "1", text: "The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of visitors.", sentiment: 'mixed' },
    { value: "2", text: "Some value 2...", sentiment: 'negative' },
    { value: "3", text: "Some value 2...", sentiment: 'neutral' },
]

// timeline
const timelineData = [{year: 2000, event: 'In a hole in the ground there lived a hobbit.'}, 
    {year: 2007, event: 'Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandyhole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.'},
    {year: 2009, event: 'It had a perfectly round door like a porthole, painted green, with a shiny yellow brass knob in the exact middle.'},
    {year: 2010, event: 'The door opened on to a tube-shaped hall like a tunnel: a very comfortable tunnel without smoke, with panelled walls, and floors tiled and carpeted, provided with polished chairs, and lots and lots of pegs for hats and coats—the hobbit was fond of visitors.'},
    {year: 2015, event: 'The tunnel wound on and on, going fairly but not quite straight into the side of the hill—The Hill, as all the people for many miles round called it—and many little round doors opened out of it, first on one side and then on another.'},
    {year: 2020, event: 'No going upstairs for the hobbit: bedrooms, bathrooms, cellars, pantries (lots of these), wardrobes (he had whole rooms devoted to clothes), kitchens, dining-rooms, all were on the same floor, and indeed on the same passage.'},
    {year: 2023, event: 'The best rooms were all on the left-hand side (going in), for these were the only ones to have windows, deep-set round windows looking over his garden, and meadows beyond, sloping down to the river.'},
]

//improvements
const improvements = [
    { value: "high", title: "Highest Priority", text: ["item 1", "item 2", "item 3"] },
    { value: "more", title: "More Improvements", text: ["item 1", "item 2", "item 3"] },
]

const themes = [
    {"title": "Academic Difficulty", "impactScore": 10, "category": "cat3",},
    {"title": "Belonging", "impactScore": 5, "category": "cat2",},
    {"title": "Career Preparation", "impactScore": 7, "category": "cat1",},
    {"title": "Cultural Representation", "impactScore": 8, "category": "cat2",},
    {"title": "Faculty Support", "impactScore": 10, "category": "cat1",},
    {"title": "Family Pressure", "impactScore": 5, "category": "cat2",},
    {"title": "Financial Struggles", "impactScore": 7, "category": "cat1",},
    {"title": "Identity & Discrimination", "impactScore": 1, "category": "cat2",},
    {"title": "Mental Health", "impactScore": 10, "category": "cat1",},
    {"title": "Language Barriers", "impactScore": 5, "category": "cat2",},
    {"title": "Peer Relationships", "impactScore": 3, "category": "cat1",},
    {"title": "Personal Growth", "impactScore": 7, "category": "cat2",},
    {"title": "Support Networks", "impactScore": 2, "category": "cat1",},
    {"title": "Work-Life Balance", "impactScore": 1, "category": "cat3",},
]

