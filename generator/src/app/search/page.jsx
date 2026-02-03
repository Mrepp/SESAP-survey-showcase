'use client'
import {
    Accordion,
    Box,
    Button,
    Checkmark,
    Container,
    Heading,
    Grid,
    GridItem,
    Listbox,
    Separator,
    Span,
    Stack,
    StackSeparator,
    Text,
    createListCollection,
  useListboxItemContext,
} from "@chakra-ui/react"
//import { colorPalettes } from "compositions/lib/color-palettes"
import SearchBar from "@/components/SearchBar"

export default function Search() {
    return (
        <>
            <Box marginBottom='20px' >
                <SearchBar/>
            </Box>
                
            

            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                {/* Filter Menu */}
                <Container w='250px' p='0'>
                    <Accordion.Root collapsible multiple defaultValue={["a", "b", "c"]} >
                        {items.map((item, index) => (
                            <Accordion.Item key={index} value={item.value}>
                            <Accordion.ItemTrigger>
                                <Span flex="1">{item.title}</Span>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    <Listbox.Root collection={item.options} selectionMode="multiple">
                                        <Listbox.Content>
                                            {item.options.items.map((option) => (
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
                        ))}
                    </Accordion.Root>
                </Container>
                
                {/* Results */}
                <Container bg='purple.100'>
                    <Box bg='blue.100'>
                        # Results 
                        <Button variant='surface' >Clear Filter</Button>
                        
                    </Box>

                    <Box bg='blue.300'>
                        Results
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


const items = [
  { value: "a", title: "Themes", options: themes },
  { value: "b", title: "Year", options: years },
  { value: "c", title: "Sentiment", options: sentiments },
]