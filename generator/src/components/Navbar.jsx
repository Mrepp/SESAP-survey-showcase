'use client'
import {
    Box,
    Center,
    Flex,
    Link,
} from "@chakra-ui/react"


export default function Navbar () {
    return (
        <Center bg="osuNavGray" w="100%" h="90%">
            <Box p={4}>
                <Flex gap="12" justify="space-between">
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
        </Center>
    )
}

