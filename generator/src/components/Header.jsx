'use client'
import {
    Box,
    HStack,
    Image,
    StackSeparator,
    Text,  
} from "@chakra-ui/react"


export default function Header () {
    return(
        <Box bg='white' h="100px" maxW="100%">
            <HStack h='100%' separator={<StackSeparator />}>
                <Box>
                    <Image src="/OSU_horizontal_2C_O_over_B.png" alt="OSU logo" maxH="75px" maxW="100%" margin='10px' />
                </Box>
                
                <Text color='beavOrange' fontSize="2xl" fontWeight="bold" margin='10px'>
                    Student Experience Story Archive Project
                </Text>
            </HStack>
        </Box>
    )
}
