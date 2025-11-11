'use client'
import {
    Box,
    Container,
} from "@chakra-ui/react"


export default function Main ({children}) {
    return(
        <Container bg='osuOffWhite' centerContent='true' flexGrow={1}>
            <Box w='60%'>
                {children}
            </Box>
        </Container>
    )
}