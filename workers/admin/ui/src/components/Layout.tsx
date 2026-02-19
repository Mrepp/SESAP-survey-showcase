import { Box, Flex, Text, Link as ChakraLink } from '@chakra-ui/react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard' },
  { path: '/upload', label: 'Upload' },
];

export function Layout() {
  const location = useLocation();

  return (
    <Flex minH="100vh" direction="column">
      {/* Header */}
      <Box
        as="header"
        bg="sidebar.bg"
        color="white"
        px={6}
        py={4}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        borderBottom="1px solid"
        borderColor="whiteAlpha.100"
      >
        <Text fontFamily="heading" fontSize="xl" fontWeight="700" letterSpacing="-0.02em">
          SESAP Admin
        </Text>
        <Flex gap={3}>
          {navItems.map((item) => (
            <ChakraLink
              key={item.path}
              asChild
            >
              <Link
                to={item.path}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: location.pathname === item.path ? '#f8fafc' : '#e2e8f0',
                  background: location.pathname === item.path ? '#334155' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {item.label}
              </Link>
            </ChakraLink>
          ))}
        </Flex>
      </Box>

      {/* Content */}
      <Box flex={1} bg="surface.page" minH={0}>
        <Outlet />
      </Box>
    </Flex>
  );
}
