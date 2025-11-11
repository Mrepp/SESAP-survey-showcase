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
                    <Link color='black' href='/narratives'>Narratives</Link>
                    <Link color='black' href='/visualizations'>Visualizations</Link>
                    <Link color='black' href='/purpose'>Purpose</Link>
                    <Link color='black' href='/recs'>Recommendations</Link>
                </Flex>
            </Box>
        </Center>
    )
}

