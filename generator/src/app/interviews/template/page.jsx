import {
    Accordion,
    Carousel,
    Container,
    Image,
    Span,
    Stack,
    StackSeparator,
    Tabs,
    Text
} from "@chakra-ui/react"
import { LuClipboardList, LuCalendarDays, LuSquareCheck } from "react-icons/lu"

export default function Template() {
    return (
        <>
            <Stack direction="row" h="fit-content" separator={<StackSeparator />}>

                <Container>
                    <Image src="/placeholder16x9.jpg" alt="placeholder" maxH="100%" maxW="100%" margin='10px' />
                    <Text fontSize='2xl' fontWeight='bold' margin='10px'>Firstname Lastname</Text>
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

                        <Tabs.Content value="overview">
                            Overview:
                            Key summaries w/category badge pills
                            quotes carousel
                            theme cloud with bubble sizes representing impact scores (1-10 scale)
                        </Tabs.Content>
                        <Tabs.Content value="timeline">
                            Timeline: timeline w hover
                        </Tabs.Content>
                        <Tabs.Content value="improvements">
                            areas for improvement accordion
                            stakeholder tags on improvement areas

                            <Accordion.Root multiple defaultValue={["high"]}>
                                {improvements.map((item, index) => (
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

                        </Tabs.Content>

                    </Tabs.Root>
                </Container>
            </Stack>
        </>
    )
}

const improvements = [
  { value: "high", title: "Highest Priority", text: "Some value 1..." },
  { value: "more", title: "More Improvements", text: "Some value 2..." },
]
