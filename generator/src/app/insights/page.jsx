'use client'
import {
    Box,
    Flex,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react"
import BarChart from '@/components/visualizations/BarChart'
import Correlation from '@/components/visualizations/CorrelationHeatMap'
import WordCloud from "@/components/visualizations/WordCloud"

export default function Insights() {
    return (
        <>
            
            {/*<Box bg='white' w='fill' h='300px' marginTop='-30px' marginLeft='-30px' marginRight='-30px' >
                <WordCloud/>
            </Box>*/}
            <Stack direction={{ base: "column", md: "row" }}>
                <Box bg='white' w='40%' minH='75vh' borderWidth="1px" borderRadius='25px'>
                    <WordCloud/>
                </Box>

                <Stack>
                    <Box w='100%' h='fit-content' bg='white' borderWidth="1px" borderRadius='25px' w='fit-content' paddingLeft='20px' paddingTop='20px' paddingBottom='20px'>
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