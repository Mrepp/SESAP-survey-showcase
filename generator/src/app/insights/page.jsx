'use client'
import {
    Box,
    Heading,
    Text
} from "@chakra-ui/react"
import BarChart from '@/components/visualizations/BarChart'
import Correlation from '@/components/visualizations/CorrelationHeatMap'
import WordCloud from "@/components/visualizations/WordCloud"

export default function Insights() {
    return (
        <>
            

            <Box w='fill' marginTop='-30px' marginLeft='-30px' marginRight='-30px' >
                <WordCloud/>
            </Box>

            <Box w='75%'>
                <BarChart/>
            </Box>

            <Box>
                <Correlation/>
            </Box>
        </>
    )
}