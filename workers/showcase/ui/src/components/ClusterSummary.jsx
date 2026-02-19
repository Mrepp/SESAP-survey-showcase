import { Box, Text, VStack } from '@chakra-ui/react';

export function ClusterSummary({ clusters }) {
  if (!clusters?.length) return null;

  return (
    <Box mt={8}>
      <Text fontWeight="600" fontSize="lg" mb={4}>
        Cluster Analysis
      </Text>
      <Box
        bg="surface.card"
        border="1px solid"
        borderColor="surface.border"
        borderRadius="md"
        minH="200px"
        p={4}
      >
        <Text mb={2}>
          {clusters.length} clusters across{' '}
          {new Set(clusters.map((c) => c.category).filter(Boolean)).size || 1} categories.
        </Text>
        <VStack align="stretch" gap={1}>
          {clusters.map((cl) => (
            <Text key={(cl.category || '') + '-' + cl.clusterId} fontSize="sm">
              <strong>
                {cl.category ? cl.category + ' — ' : ''}Cluster {cl.clusterId}
              </strong>
              : {cl.members.length} interviews (cohesion: {cl.cohesion.toFixed(3)})
            </Text>
          ))}
        </VStack>
      </Box>
    </Box>
  );
}
