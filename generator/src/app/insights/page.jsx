'use client'
import {
    Box,
    Flex,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react"
import BarChart from '@/components/visualizations/BarChart'
import BubbleChart from "@/components/visualizations/BubbleChart"
import Correlation from '@/components/visualizations/CorrelationHeatMap'
import WordCloud from "@/components/visualizations/WordCloud"

export default function Insights() {
    return (
        <>
            
            {/*<Box bg='white' w='fill' h='300px' marginTop='-30px' marginLeft='-30px' marginRight='-30px' >
                <WordCloud/>
            </Box>*/}
            <Stack direction={{ base: "column", md: "row" }} h='100vh' gap='20px'>
                <Stack w='40%' h='100%' gap='20px'>
                    <Box bg='white' w='100%'  borderWidth="1px" borderRadius='25px'>
                        <WordCloud/>
                    </Box>

                    <Box bg='white'   borderWidth="1px" borderRadius='25px' p='15px'>
                        <BubbleChart  data={themes}/>
                    </Box>
                </Stack>
                
                <Stack h='100%' gap='20px'>
                    <Box w='fit-content' h='fit-content' bg='white' borderWidth="1px" borderRadius='25px' paddingLeft='20px' paddingTop='20px' paddingBottom='20px'>
                        <Correlation/>
                    </Box>

                    <Box minH='300px' h='fit-content' bg='white' padding='20px' borderWidth="1px" borderRadius='25px'>
                        <BarChart/>
                    </Box>
                </Stack>
            </Stack>
        </>
    )
}

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