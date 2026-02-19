import { useState } from 'react';
import { Box, Flex, Text, IconButton } from '@chakra-ui/react';

interface ArrayItemCardProps {
  title: string;
  subtitle?: string;
  accentColor: string;
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function ArrayItemCard({
  title,
  subtitle,
  accentColor,
  index,
  onRemove,
  children,
  defaultExpanded = false,
}: ArrayItemCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <Box
      bg="surface.card"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.100"
      borderLeft="3px solid"
      borderLeftColor={accentColor}
      overflow="hidden"
      transition="all 0.15s"
      _hover={{ shadow: 'sm' }}
    >
      {/* Header */}
      <Flex
        px={4}
        py={3}
        alignItems="center"
        cursor="pointer"
        onClick={() => setExpanded(!expanded)}
        _hover={{ bg: 'gray.50' }}
      >
        <Text fontSize="xs" color="gray.400" fontWeight="600" mr={3} fontFamily="mono">
          #{index + 1}
        </Text>
        <Box flex={1} minW={0}>
          <Text fontSize="sm" fontWeight="600" color="gray.800" truncate>
            {title || 'Untitled'}
          </Text>
          {subtitle && (
            <Text fontSize="xs" color="gray.500" truncate>
              {subtitle}
            </Text>
          )}
        </Box>
        <Flex gap={1} alignItems="center" ml={2}>
          <IconButton
            aria-label="Remove item"
            size="xs"
            variant="ghost"
            colorPalette="red"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Text fontSize="sm">&times;</Text>
          </IconButton>
          <Text fontSize="xs" color="gray.400" ml={1}>
            {expanded ? '▲' : '▼'}
          </Text>
        </Flex>
      </Flex>

      {/* Body */}
      {expanded && (
        <Box px={4} pb={4} pt={1} borderTop="1px solid" borderColor="gray.50">
          {children}
        </Box>
      )}
    </Box>
  );
}
