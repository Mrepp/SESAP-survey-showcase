'use client'
import {
    Box,
    HStack,
    Image,
    Text,
} from "@chakra-ui/react"
import { HiStar } from "react-icons/hi"

export default function Interview ({data}) {
    return (
        <Box maxW="sm" borderWidth="1px" shadow="md" borderRadius='25px' overflow="hidden">
            <Image src={data.videoUrl} alt={data.videoAlt} borderTopRadius='25px' />

            <Box p="4" spaceY="2" bg='white'>
                <Text fontWeight="medium" color="fg">
                    {data.name}
                </Text>
                <HStack color="fg.muted">
                    {data.date}
                </HStack>
            </Box>
        </Box>
    )
}