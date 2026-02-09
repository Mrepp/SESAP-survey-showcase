'use client'
import {
    Box,
    Heading,
    Text
} from "@chakra-ui/react"
import WordCloud from "@/components/visualizations/WordCloud"
import BarChart from '@/components/visualizations/BarChart'

export default function Insights() {
    return (
        <>
            <Heading>Insights</Heading>
            <Box w='fill' marginTop='-30px' marginLeft='-30px' marginRight='-30px' >
                <WordCloud/>
            </Box>
            <BarChart/>
        </>
        
    )
}