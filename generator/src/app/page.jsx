'use client'
import { useEffect, useState } from 'react'
import {
    Box,
    Flex,
    Heading,
    Link,
    Separator,
    ScrollArea,
    Stack,
    Text
} from "@chakra-ui/react"
import Interview from '@/components/Interview'

async function getInterviewCount() {
    const res = await fetch('/api/interviews/count')
    if (!res.ok) return 0
    const { count } = await res.json()
    return count
}

export default function Home() {
    const [numInterviews, setNumInterviews] = useState(null)

    useEffect(() => {
        getInterviewCount().then(setNumInterviews)
    }, [])

    const recents = [
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-03-31', description: ""},
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
        {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-03-31', description: ""},
    ]

    return (
        <>
            <Stack w='100%' marginTop='75px' marginBottom='75px' direction={{ base: "column", md: "row" }} >
                <Box flex='1' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Box textAlign='left'>
                        <Heading m='0' size="6xl">{numInterviews ?? '11'}</Heading>
                        <Text fontSize='xl' fontWeight='medium'>
                            interviews
                        </Text>
                    </Box>
                </Box>
                
                <Separator orientation={{ base: "vertical", sm: "horizontal" }} size='lg'/>
                <Box flex='1' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Box textAlign='left'>
                        <Text fontSize='xl' fontWeight='medium'>
                            Since
                        </Text>
                        <Heading m='0' size="6xl">2023</Heading>
                    </Box>
                </Box>
                
                <Separator orientation={{ base: "vertical", sm: "horizontal" }}size='lg'/>
                <Box flex='1' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Box textAlign='left'>
                        <Text fontSize='xl' fontWeight='medium'>
                            Exploring <Link fontWeight='bold' fontSize='xl' color='beavOrange' href='/themes'>themes →</Link>
                        </Text>
                        <Text fontSize='xl' fontWeight='medium'>
                            in student <Link fontWeight='bold' fontSize='xl' color='beavOrange' href='/interviews'>narratives →</Link>
                        </Text>
                        <Text fontSize='xl' fontWeight='medium'>
                            via data <Link fontWeight='bold' fontSize='xl' color='beavOrange' href='/insights'>visualization →</Link>
                        </Text>
                    </Box>
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
