'use client'
import {
    Box,
    HStack,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react"
import { HiStar } from "react-icons/hi"

export default function Result ({data}) {
    return (
        <Box w="stretch" h='150px' borderRadius='5px' bg='white' shadow="md" overflow="hidden">
            <Stack direction="row">
                <Image maxH='150px' src={data.videoUrl} alt={data.videoAlt} />

                <Box w='stretch' p="4" spaceY="2" bg='white'>
                    <Text fontWeight="medium" color="fg">
                        {data.name}
                    </Text>
                    <HStack color="fg.muted">
                        {data.date}
                    </HStack>
                    <Text>{data.description}</Text>
                </Box>
            </Stack>
        </Box>
    )
}