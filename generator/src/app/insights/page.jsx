'use client'
import {
    Box,
    Heading,
    Text
} from "@chakra-ui/react"
import WordCloud from "@/components/visualizations/WordCloud"


export default function Insights() {
    return (
        <>
            <Heading>Insights</Heading>
            <Box w='fill' marginTop='-20px' marginLeft='-20px' marginRight='-20px' >
                <WordCloud/>
            </Box>
        </>
        
    )
}