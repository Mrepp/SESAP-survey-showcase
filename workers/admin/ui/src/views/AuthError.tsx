'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Flex, Text, Button } from '@chakra-ui/react';

export function AuthError() {
  const searchParams = useSearchParams();
  const message = searchParams?.get('message') || 'Authentication required';

  return (
    <Flex minH="60vh" align="center" justify="center">
      <Box
        bg="white"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="xl"
        p={10}
        maxW="480px"
        w="100%"
        textAlign="center"
      >
        <Text fontSize="4xl" mb={4}>🔒</Text>
        <Text fontSize="xl" fontWeight="700" color="gray.800" mb={3}>
          Authentication Required
        </Text>
        <Text color="gray.600" mb={6}>
          {message}
        </Text>
        <Button
          colorPalette="blue"
          onClick={() => { window.location.href = '/'; }}
        >
          Try Again
        </Button>
        <Text fontSize="xs" color="gray.400" mt={6}>
          Ensure Cloudflare Access is configured and your email is on the whitelist.
        </Text>
      </Box>
    </Flex>
  );
}
