'use client'
import {
    Accordion,
    Box,
    Button,
    Checkmark,
    Container,
    Grid,
    GridItem,
    Listbox,
    Span,
    Stack,
    StackSeparator,
    Text,
    createListCollection,
  useListboxItemContext,
} from "@chakra-ui/react"
import { useState } from "react"
//import { colorPalettes } from "compositions/lib/color-palettes"
import SearchBar from "@/components/SearchBar"
import Result from '@/components/ResultsCard'

export default function Search() {
    const [selectedThemes, setSelectedThemes] = useState([])
    const [selectedYears, setSelectedYears] = useState([])
    const [selectedSentiments, setSelectedSentiments] = useState([])

    const clearAllFilters = () => {
        setSelectedThemes([])
        setSelectedYears([])
        setSelectedSentiments([])
    }

    return (
        <>
            <Box marginBottom='50px' >
                <SearchBar/>
            </Box>

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                {/* Filter Menu */}
                <Container w='250px' p='0' paddingRight='10px'>

                    {/* Themes */}
                    <Accordion.Root collapsible multiple defaultValue={["a", "b", "c"]} >
                        <Accordion.Item value="a">
                            <Accordion.ItemTrigger>
                                <Span flex="1" color='beavOrange'>Themes</Span>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Listbox.Root 
                                        collection={themes} 
                                        selectionMode="multiple"
                                        value={selectedThemes}
                                        onValueChange={(e) => setSelectedThemes(e.value)}
                                    >
                                        <Listbox.Content>
                                            {themes.items.map((option) => (
                                            <Listbox.Item item={option} key={option.value}>
                                                <ListboxItemCheckmark />
                                                <Listbox.ItemText>{option.label}</Listbox.ItemText>
                                            </Listbox.Item>
                                            ))}
                                        </Listbox.Content>
                                    </Listbox.Root>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>

                        {/* Year */}
                        <Accordion.Item value="b">
                            <Accordion.ItemTrigger>
                                <Span flex="1" color='beavOrange'>Year</Span>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Listbox.Root 
                                        collection={years} 
                                        selectionMode="multiple"
                                        value={selectedYears}
                                        onValueChange={(e) => setSelectedYears(e.value)}
                                    >
                                        <Listbox.Content>
                                            {years.items.map((option) => (
                                            <Listbox.Item item={option} key={option.value}>
                                                <ListboxItemCheckmark />
                                                <Listbox.ItemText>{option.label}</Listbox.ItemText>
                                            </Listbox.Item>
                                            ))}
                                        </Listbox.Content>
                                    </Listbox.Root>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>

                        {/* Sentiment */}
                        <Accordion.Item value="c">
                            <Accordion.ItemTrigger>
                                <Span flex="1" color='beavOrange'>Sentiment</Span>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Listbox.Root 
                                        collection={sentiments} 
                                        selectionMode="multiple"
                                        value={selectedSentiments}
                                        onValueChange={(e) => setSelectedSentiments(e.value)}
                                    >
                                        <Listbox.Content>
                                            {sentiments.items.map((option) => (
                                            <Listbox.Item item={option} key={option.value}>
                                                <ListboxItemCheckmark />
                                                <Listbox.ItemText>{option.label}</Listbox.ItemText>
                                            </Listbox.Item>
                                            ))}
                                        </Listbox.Content>
                                    </Listbox.Root>
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    </Accordion.Root>
                </Container>
                
                
                {/* Results */}
                <Container paddingRight='0'>

                    {/* Description */}
                    <Box marginBottom='20px' display='flex' justifyContent='space-between' alignItems='center'>
                        <Text>{results.length} Results for </Text>
                        <Button variant='surface' onClick={clearAllFilters}>Clear Filter</Button>
                    </Box>

                    {/* Result Items */}
                    <Box>
                        {results.map((item, index) => (
                            <GridItem key={index} 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            paddingBottom='15px'
                            >
                                <Result data={item} />
                            </GridItem>
                        ))}
                    </Box>
                </Container>

            </Stack>
        </>
    )
}


const ListboxItemCheckmark = () => {
  const itemState = useListboxItemContext()
  return (
    <Checkmark
      filled
      size="sm"
      checked={itemState.selected}
      disabled={itemState.disabled}
    />
  )
}

// Filters
const years = createListCollection({
  items: [
    { label: "2000-2004", value: "react" },
    { label: "2005-2009", value: "vue" },
    { label: "2010-2014", value: "angular" },
    { label: "2015-2019", value: "svelte" },
    { label: "2020-2024", value: "nextjs" },
    { label: "2025-2029", value: "nuxtjs" },
  ],
})

const sentiments = createListCollection({
  items: [
    { label: "Positive", value: "positive" },
    { label: "Neutral", value: "neutral" },
    { label: "Negative", value: "negative" },
  ],
})

const themes = createListCollection({
  items: [
    { label: "Academic Difficulty", value: "academic difficulty" },
    { label: "Faculty Support", value: "faculty support" },
    { label: "Peer Relationships", value: "peer relationships" },
    { label: "Belonging", value: "belonging" },
    { label: "Cultural Representation", value: "cultural representation" },
    { label: "Financial Struggles", value: "financial struggles" },
    { label: "Mental Health", value: "mental health" },
    { label: "Family Pressure", value: "family pressure" },
    { label: "Work-Life Balance", value: "work-life balance" },
    { label: "Identity & Discrimination", value: "identity & discrimination" },
    { label: "Career Preparation", value: "career preparation" },
    { label: "Language Barriers", value: "language barriers" },
    { label: "Support Networks", value: "support networks" },
    { label: "Personal Growth", value: "personal growth" },
  ],
})




const results = [
    {interviewId: '0', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '1', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2024-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '2', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '3', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2022-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '4', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '5', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-04-30', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '6', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-05-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '7', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2025-05-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '8', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2025-05-25', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '9', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
    {interviewId: '10', videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: "Student discusses challenges with academic workload and finding balance. Emphasizes importance of faculty support and peer relationships in navigating the EECS program successfully."},
]