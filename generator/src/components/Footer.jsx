'use client'
import {
    Box,
    Center,
    Text,  
} from "@chakra-ui/react"


export default function Footer () {
    return(
        <Center bg='#423e3c' borderTop="4px solid #D73F09" h="100px" maxW="100%">
            <Box>
                <Text fontSize="sm" color='white'>
                    footer stuff
                </Text>
            </Box>
        </Center>
    )
}