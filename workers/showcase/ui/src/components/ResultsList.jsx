import { Box, Flex, Text, VStack } from '@chakra-ui/react';
import { ResultCard } from './ResultCard';

export function ResultsList({ results, isSemantic, searchIndex, interviews, clusterMap }) {
  if (!results) return null;

  if (results.length === 0) {
    return (
      <Box borderBottom="1px solid" borderColor="surface.border" pb={2} mb={2}>
        <Text fontWeight="600" fontSize="lg">
          No results found
        </Text>
      </Box>
    );
  }

  function findDocument(id) {
    return searchIndex?.documents?.find((d) => d.id === id) || null;
  }

  function findInterview(id) {
    if (!interviews) return null;
    let iv = interviews.find((iv) => iv.id === id);
    if (iv) return iv;
    const doc = findDocument(id);
    if (doc) {
      iv = interviews.find((iv) => iv.id === doc.interviewId);
    }
    return iv || null;
  }

  return (
    <VStack gap={4} align="stretch">
      <Flex
        justify="space-between"
        align="center"
        borderBottom="1px solid"
        borderColor="surface.border"
        pb={2}
      >
        <Text fontWeight="600" fontSize="lg">
          Search Results
        </Text>
        <Text fontSize="sm" color="fg.muted">
          {results.length} results
        </Text>
      </Flex>
      {results.map((r) => {
        const doc = findDocument(r.id);
        const interview = findInterview(r.id);
        const interviewId = interview?.id || doc?.interviewId || '';
        return (
          <ResultCard
            key={r.id}
            result={r}
            document={doc}
            interview={interview}
            clusterId={clusterMap.get(interviewId)}
            isSemantic={isSemantic}
          />
        );
      })}
    </VStack>
  );
}
