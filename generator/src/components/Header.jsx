'use client'
import {
    Box,
    Center,
    Text,  
} from "@chakra-ui/react"


export default function Header () {
    return(
        <Center bg='white' h="100px" maxW="100%">
            <Box>
                <Text color='beavOrange' fontSize="3xl" fontWeight="bold">
                    Student Experience Story Archive Project
                </Text>
            </Box>
        </Center>
    )
}
