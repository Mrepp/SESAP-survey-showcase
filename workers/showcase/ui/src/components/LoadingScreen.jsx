import { Box, Text, VStack } from '@chakra-ui/react';

export function LoadingScreen({ progress, statusText, error }) {
  if (error) {
    return (
      <Box textAlign="center" p={12} maxW="600px" mx="auto">
        <Box
          bg="red.50"
          border="1px solid"
          borderColor="red.200"
          p={4}
          borderRadius="md"
          color="red.600"
          fontSize="sm"
        >
          Error: {error}
        </Box>
      </Box>
    );
  }

  return (
    <VStack gap={3} textAlign="center" p={12}>
      <Text fontSize="md">Loading search indexes...</Text>
      <Box
        w="100%"
        maxW="400px"
        h="8px"
        bg="gray.200"
        borderRadius="4px"
        overflow="hidden"
      >
        <Box
          h="100%"
          w={`${progress}%`}
          bg="brand.500"
          borderRadius="4px"
          transition="width 0.3s ease"
        />
      </Box>
      <Text fontSize="sm" color="fg.muted">
        {statusText}
      </Text>
    </VStack>
  );
}
