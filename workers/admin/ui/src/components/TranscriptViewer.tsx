import { Box, Flex, Text, Code } from '@chakra-ui/react';

interface Props {
  transcript: string;
  /** When true, the transcript fills the available container height instead of capping at 500px */
  fillHeight?: boolean;
}

export function TranscriptViewer({ transcript, fillHeight }: Props) {
  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  return (
    <Flex direction="column" h={fillHeight ? '100%' : 'auto'}>
      <Flex gap={4} mb={3} flexShrink={0}>
        <Flex
          bg="blue.50"
          px={3}
          py={1.5}
          borderRadius="md"
          alignItems="center"
          gap={2}
        >
          <Text fontSize="xs" color="blue.600" fontWeight="600">Word Count</Text>
          <Text fontSize="sm" fontWeight="700" color="blue.800">{wordCount.toLocaleString()}</Text>
        </Flex>
        <Flex
          bg={wordCount > 50 ? 'green.50' : 'red.50'}
          px={3}
          py={1.5}
          borderRadius="md"
          alignItems="center"
          gap={2}
        >
          <Text fontSize="xs" color={wordCount > 50 ? 'green.600' : 'red.600'} fontWeight="600">
            Min Length
          </Text>
          <Text fontSize="sm" fontWeight="700" color={wordCount > 50 ? 'green.800' : 'red.800'}>
            {wordCount > 50 ? 'Passed' : 'Warning'}
          </Text>
        </Flex>
      </Flex>

      <Code
        display="block"
        whiteSpace="pre-wrap"
        bg="gray.50"
        p={4}
        borderRadius="md"
        border="1px solid"
        borderColor="gray.200"
        fontSize="sm"
        flex={fillHeight ? 1 : undefined}
        maxH={fillHeight ? undefined : '500px'}
        overflowY="auto"
        lineHeight="1.7"
        color="gray.700"
      >
        {transcript}
      </Code>
    </Flex>
  );
}
