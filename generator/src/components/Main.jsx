'use client'
import {
    Box,
    Container,
} from "@chakra-ui/react"


export default function Main ({children}) {
    return(
        <Container bg='osuOffWhite' centerContent='true' flexGrow={1}>
            <Box w='100%' margin='20px'>
                {children}
            </Box>
        </Container>
    )
}