'use client'
import { useEffect } from 'react'
import {
    Box,
    Heading,
    Text,
} from "@chakra-ui/react"
import SearchBar from "@/components/SearchBar"

const PAGE_TITLE = 'Page Not Found | SESAP'

export default function NotFound() {
    useEffect(() => {
        document.title = PAGE_TITLE
    }, [])
    return (
        <Box height='100%' display='flex' flexDirection='column' alignItems='center'>
            <Heading size='4xl'>Page Not Found</Heading>

            <Box w='50%' m='50px' textAlign='center'>
                <Text fontWeight='medium' fontSize='lg' >Want to look for something else instead?</Text>
                <SearchBar placeholder="Search site"/>
            </Box>
        </Box>
    )
}