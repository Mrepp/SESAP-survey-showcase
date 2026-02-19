import { Box, Flex, Text } from '@chakra-ui/react';

export function Layout({ children }) {
  return (
    <Flex direction="column" minH="100vh" bg="surface.bg" fontFamily="body">
      <Box
        as="header"
        bg="surface.card"
        borderBottom="1px solid"
        borderColor="surface.border"
        py={6}
        px={8}
        textAlign="center"
      >
        <Text fontSize="xl" fontWeight="700" mb={1}>
          SESAP Survey Showcase
        </Text>
        <Text fontSize="sm" color="fg.muted">
          Interview Analysis Search &amp; Validation
        </Text>
      </Box>

      <Box as="main" flex={1} maxW="960px" w="100%" mx="auto" py={8} px={4}>
        {children}
      </Box>

      <Box
        as="footer"
        textAlign="center"
        p={4}
        borderTop="1px solid"
        borderColor="surface.border"
        fontSize="xs"
        color="fg.muted"
      >
        SESAP Survey Showcase &copy; {new Date().getFullYear()}
      </Box>
    </Flex>
  );
}
