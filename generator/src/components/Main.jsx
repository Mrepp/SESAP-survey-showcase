'use client'
import {
    Box,
    Center,
    Text,  
} from "@chakra-ui/react"


export default function Main ({children}) {
    return(
        <Box bg='#f7f5f5' w='100%' flexGrow={1}>
            {children}
        </Box>
    )
}