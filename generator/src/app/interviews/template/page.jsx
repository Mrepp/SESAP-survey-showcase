import {
    Accordion,
    Box,
    Carousel,
    Container,
    Image,
    Stack,
    StackSeparator,
    Tabs,
    Text
} from "@chakra-ui/react"

export default function Template() {
    return (
        <>
            <Stack direction="row" h="stretch" separator={<StackSeparator />}>
                <Container centerContent='true'>
                    <Image src="/placeholder16x9.jpg" alt="placeholder" maxH="100%" maxW="100%" margin='10px' />
                    <Text>Firstname Lastname</Text>
                </Container>

                <Container>
                    Overview:
                    Key summaries w/category badge pills
                    quotes carousel

                    Timeline: timeline w hover

                    theme cloud with bubble sizes representing impact scores (1-10 scale)

                    Improvement:
                    areas for improvement accordion
                    stakeholder tags on improvement areas
                </Container>
            </Stack>
        </>
    )
}