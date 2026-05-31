'use client'
import {
    Box,
    HStack,
    Image,
    Stack,
    Text,
} from "@chakra-ui/react"
import Highlighter from "react-highlight-words"


export default function Result({ data, highlightQuery }) {
    return (
        <Box w="stretch" h='150px' borderRadius='5px' bg='white' shadow="md" overflow="hidden">
            <Stack direction="row">
                {data.video?.embedUrl ? (
                    <Box
                        as="iframe"
                        src={data.video.embedUrl}
                        title={data.videoAlt}
                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                        allowFullScreen
                        referrerPolicy="strict-origin-when-cross-origin"
                        w="267px"
                        h="150px"
                        border="0"
                        flexShrink={0}
                        pointerEvents="none"
                    />
                ) : (
                    <Image
                        w="267px"
                        h="150px"
                        objectFit="cover"
                        src={data.videoUrl}
                        alt={data.videoAlt}
                        flexShrink={0}
                    />
                )}

                <Box w='stretch' p="4" spaceY="2" bg='white'>
                    <Text fontWeight="medium" color='beavOrange'>
                        {data.name}
                    </Text>
                    <HStack color="fg.muted">
                        {data.date}
                    </HStack>
                    <Highlighter
                        searchWords={[highlightQuery]}
                        autoEscape={true}
                        textToHighlight={data.description}
                    />
                </Box>
            </Stack>
        </Box>
    )
}
