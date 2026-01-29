'use client'
import {
    Box,
    Text,
    VStack,  
} from "@chakra-ui/react"


export default function ThemeCard ({data}) {
    return(
        <Box
            width='150px' 
            aspectRatio='1/1'
            borderWidth="1px" 
            borderRadius='25px'
            p="4"
            spaceY="2"
            overflow="hidden"
            shadow="md"
            bg='white'
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            >
            <Text fontWeight="medium" color="fg" textAlign="center">
                {data.theme}
            </Text>
            <VStack color="fg.muted" justifyContent="center" gap='0'>
                <Text textStyle='sm'>Impact Score: {data.impactScore}</Text>
                <Text textStyle='sm'>Frequency: {data.frequency}</Text>
            </VStack>
        </Box>
    )
}