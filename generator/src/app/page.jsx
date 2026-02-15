'use client'
import {
    Box,
    Container,
    Flex,
    Heading,
    Separator,
    ScrollArea,
    Stack,
    Text
} from "@chakra-ui/react"
import Interview from '@/components/Interview'

export default function Home() {
    return (
        <>
            <Stack w='100%' marginTop='75px' marginBottom='75px' direction={{ base: "column", md: "row" }} >
                <Box flex='1' textAlign='center' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Heading m='0' size="6xl">{numInterviews}</Heading>
                    <Text>
                        interviews
                    </Text>
                </Box>
                
                <Separator orientation={{ base: "vertical", sm: "horizontal" }} size='lg'/>
                <Box flex='1' textAlign='center' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    
                    <Text>
                        Since
                    </Text>
                    <Heading m='0' size="6xl">2023</Heading>
                </Box>
                
                <Separator orientation={{ base: "vertical", sm: "horizontal" }}size='lg'/>
                <Box flex='1' textAlign='center' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Text>
                        think of something else to put here
                    </Text>
                    <Heading m='0' size="6xl">0000</Heading>
                </Box>

                <Separator orientation={{ base: "vertical", sm: "horizontal" }} size='lg' />
                <Box w='40%' marginLeft='15px' marginRight='15px'>
                    <Heading size='2xl'>Highlighting the stories of OSU's EECS students.</Heading>
                    <Text fontWeight="semibold" color='osuGray'>
                        The EECS Student Experience Story Archive Project (SESAP) collects the narrative statements of students from underserved and marginalized communities. 
                        Video testimonies are recorded and submitted by students in order to document their experiences in EECS programs. These are then analyzed in order to 
                        highlight ways in which university and industry leaders can better support engineering students from underserved communities.
                    </Text>
                </Box>
            </Stack>

            <Stack w='100%' marginTop='50px' marginBottom='50px' direction={{ base: "column", md: "row" }} >
                <Box textAlign='left' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Heading paddingLeft='15px' size="3xl">Recent Interviews</Heading>
                </Box>

                <ScrollArea.Root  >
                    <ScrollArea.Viewport>
                        <ScrollArea.Content py="4">
                            <Flex gap="4" flexWrap="nowrap">
                                {recents.map((item, index) => (
                                    <Interview key={index} data={item}/>
                                ))}
                            </Flex>
                        </ScrollArea.Content>
                    </ScrollArea.Viewport>
                    <ScrollArea.Scrollbar orientation="horizontal" />
                    <ScrollArea.Corner />
                </ScrollArea.Root>

                {/*<Separator orientation={{ base: "vertical", sm: "horizontal" }} size='lg' />*/}
            </Stack>

            

        </>
    )
}

const recents = [
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-03-31', description: ""},
]

const numInterviews = 20
