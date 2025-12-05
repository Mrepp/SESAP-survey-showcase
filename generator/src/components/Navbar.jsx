'use client'
import {
    Box,
    Flex,
    Link,
} from "@chakra-ui/react"


export default function Navbar () {
    return (
        <Box bg="osuNavGray" w="100%" h="100%" p={4}>
            <Flex gap="10" >
                <Link color='black' href='/'>Home</Link>
                <Link color='black' href='/interviews'>Interviews</Link>
                <Link color='black' href='/insights'>Demographic Insights</Link>
                <Link color='black' href='/themes'>Themes</Link>
                <Link color='black' href='/timeline'>Timeline</Link>
                <Link color='black' href='/improvements'>Improvements</Link>
                <Link color='black' href='/search'>Search</Link>
                <Link color='black' href='/about'>About</Link>
            </Flex>
        </Box>
    )
}

