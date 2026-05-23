'use client'
import {
    Box,
} from "@chakra-ui/react"


export default function Main ({children}) {
    return(
        <Box as='main' role='main' bg='osuOffWhite' flexGrow={1} p='30px'>
            {children}
        </Box>
    )
}