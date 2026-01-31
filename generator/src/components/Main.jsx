'use client'
import {
    Box,
    Container,
} from "@chakra-ui/react"


export default function Main ({children}) {
    return(
        <Container bg='osuOffWhite' flexGrow={1} p='0'>
            <Box w='fill' margin='20px'>
                {children}
            </Box>
        </Container>
    )
}