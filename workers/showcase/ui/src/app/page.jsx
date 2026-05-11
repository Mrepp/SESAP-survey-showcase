'use client'
import { useMemo } from 'react'
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
import { useDataLoader } from '@/hooks/useDataLoader'
import {formatDate} from '@/app/buildFunctions'


const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' }

export default function Home() {
    const { isReady, data } = useDataLoader()

    const numInterviews = data?.metadata?.interviewCount

    const recents = useMemo(() => {
        const list = data?.interviews
        if (!Array.isArray(list)) return []
        const sorted = [...list].sort((a, b) => {
            const dateA = a.metadata?.interviewDate ? new Date(a.metadata.interviewDate).getTime() : 0
            const dateB = b.metadata?.interviewDate ? new Date(b.metadata.interviewDate).getTime() : 0
            return dateB - dateA
        })
        return sorted.slice(0, 6).map((iv) => ({
            interviewId: iv.id,
            videoUrl: '/thumbnail.png',
            videoAlt: `${iv.title ?? ''} interview`,
            name: iv.title ?? 'Interviewee Name',
            date: formatDate(iv.metadata?.interviewDate, dateOptions),
            description: iv.description ?? '',
        }))
    }, [isReady, data?.interviews])

    return (
        <>
            <Stack w='100%' marginTop='75px' marginBottom='75px' direction={{ base: "column", md: "row" }} >
                <Box flex='1' display='flex' flexDirection='column' justifyContent='center' alignItems='center'>
                    <Box textAlign='left'>
                        <Heading m='0' size="6xl">{numInterviews ?? '-'}</Heading>
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
                                {recents.map((item) => (
                                    <Link href={`/interviews/view?id=${item.interviewId}`}>
                                        <Interview key={item.interviewId} data={item}/>
                                    </Link>
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
