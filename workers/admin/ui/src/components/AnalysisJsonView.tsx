import { Box, Code, Text } from '@chakra-ui/react';
import type { Analysis } from '@sesap/types';

interface Props {
  analysis: Analysis;
}

export function AnalysisJsonView({ analysis }: Props) {
  return (
    <Box>
      <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700" mb={3}>
        Raw Analysis JSON
      </Text>
      <Code
        display="block"
        whiteSpace="pre-wrap"
        bg="gray.900"
        color="green.300"
        p={4}
        borderRadius="md"
        fontSize="xs"
        maxH="600px"
        overflowY="auto"
        lineHeight="1.6"
        fontFamily="mono"
      >
        {JSON.stringify(analysis, null, 2)}
      </Code>
    </Box>
  );
}
