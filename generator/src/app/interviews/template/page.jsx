'use client'
import {
    Accordion,
    Box,
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
import { LuChevronLeft, LuChevronRight, LuClipboardList, LuCalendarDays, LuSquareCheck } from "react-icons/lu"
import Timeline from '@/components/visualizations/Timeline'

export default function Template() {
    const carousel = useCarousel({ slideCount: quotes.length })

    return (
        <>
            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                <Container>
                    <Image src="/placeholder16x9.jpg" alt="placeholder" maxH="100%" maxW="100%" margin='10px' />
                    <Text fontSize='2xl' fontWeight='bold' margin='10px'>{intervieweeName}</Text>
                </Container>

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
                            <Tabs.Trigger value="improvements">
                                <LuSquareCheck />
                                Improvements
                            </Tabs.Trigger>
                        </Tabs.List>

                        {/* Overview */}
                        <Tabs.Content value="overview">
                            Overview:
                            Key summaries w/category badge pills
                            quotes carousel
                            theme cloud with bubble sizes representing impact scores (1-10 scale)

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

                            <Heading>Quotes</Heading>
                            <Carousel.RootProvider value={carousel} maxW="xl" mx="auto">
                                <Carousel.ItemGroup>
                                    {quotes.map((item, index) => (
                                    <Carousel.Item key={index} index={index}>
                                        <Box w="100%" h="200px">
                                            {item.text}
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
                            <Timeline data={data}/>
                            
                            <List.Root ps='5' >
                                {data.map((item, index) => (
                                    <List.Item key={index}>
                                        <strong>{item.year}:</strong> {item.event}
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

// overview
const summaries = [
    { value: "diversity", title: "Diversity & Inclusion", text: "Some value 1..." },
    { value: "campusLife", title: "Campus Life", text: "Some value 2..." },
    { value: "keySummary", title: "Key Summary", text: "Some value 2..." },
]

// quotes
const quotes = [
    { value: "0", text: "Some value 1..." },
    { value: "1", text: "Some value 2..." },
    { value: "2", text: "Some value 2..." },
]

// timeline
const data = [{year: 2000, event: 'In a hole in the ground there lived a hobbit.'}, 
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

