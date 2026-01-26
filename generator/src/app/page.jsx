'use client'
import {
    Container,
    Heading,
    Stack,
    Text
} from "@chakra-ui/react"
import Interview from '@/components/Interview'

export default function Home() {
    return (
        <>
            <Text>
                The EECS Student Experience Story Archive Project (SESAP) collects the narrative statements of students from underserved and marginalized communities. 
                Video testimonies are recorded and submitted by students in order to document their experiences in EECS programs. These are then analyzed in order to 
                highlight ways in which university and industry leaders can better support engineering students from underserved communities.
            </Text>
            <Heading size="lg">Overview Statistics</Heading>
            <Container>
                number of interviews probably ig
            </Container>

            <Heading size="lg">Recent Interviews</Heading>
            <Container centerContent='true'>
                <Stack direction={{ base: "column", md: "row" }} gap='11'>
                    {data.map((item, index) => (
                        <Interview key={index} data={item}/>
                    ))}
                </Stack>
            </Container>
        </>
    )
}

const data = [
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: 'Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '2Firstname Lastname', date: '2023-03-31', description: ""},
    {videoUrl: '/placeholder16x9.jpg', videoAlt:'example', name: '3Firstname Lastname', date: '2023-03-31', description: ""},
]