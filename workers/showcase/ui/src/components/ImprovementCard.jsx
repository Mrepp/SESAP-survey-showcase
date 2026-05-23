'use client'
import {
    Box,
    Text,
} from "@chakra-ui/react"

export default function ImprovementCard ({area, description}) {
    return (
        <Box
            w='250px' 
            h='250px'
            aspectRatio='1/1'
            borderColor='osuOffBlack'
            borderWidth="1px" 
            borderRadius='25px'
            overflow="hidden"
            shadow="md"
            bg='white'
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            textAlign='center'
        >
            <Box
                w='100%'
                h='25%'
                paddingLeft='10px'
                paddingRight='10px'
                bg='orange.100'
                display="flex"
                flexDirection="column"
                justifyContent="center"
            >
                <Text fontWeight='semibold' lineClamp='2' >{area}</Text>
            </Box>
            
            <Box 
                w='100%'
                h='75%'
                bg='orange.50'
                padding='10px'
                borderColor='osuOffBlack'
                borderTopWidth='1px'
            >
                <Text lineClamp={7}>{description}</Text>
            </Box>
        </Box>
    )
}