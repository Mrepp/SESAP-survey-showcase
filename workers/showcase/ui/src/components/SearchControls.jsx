import { Box, Flex, Input, Button } from '@chakra-ui/react';

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'summary', label: 'Summary' },
  { value: 'themes', label: 'Themes' },
  { value: 'quotes', label: 'Quotes' },
  { value: 'collegeExperience', label: 'College Experience' },
];

export function SearchControls({
  query,
  onQueryChange,
  searchMode,
  onSearchModeChange,
  category,
  onCategoryChange,
  onSearch,
  isSearching,
  semanticAvailable,
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <Box mb={8}>
      <Flex direction="column" gap={3}>
        <Input
          placeholder="Search interviews..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          size="lg"
          bg="surface.card"
          borderColor="surface.border"
          _focus={{ borderColor: 'brand.500' }}
        />
        <Flex gap={3} wrap="wrap" align="center">
          <Flex
            border="1px solid"
            borderColor="surface.border"
            borderRadius="md"
            overflow="hidden"
          >
            <Button
              size="sm"
              bg={searchMode === 'semantic' ? 'brand.500' : 'surface.card'}
              color={searchMode === 'semantic' ? 'white' : 'fg.muted'}
              onClick={() => onSearchModeChange('semantic')}
              disabled={!semanticAvailable}
              borderRadius="0"
              _hover={{
                bg: searchMode === 'semantic' ? 'brand.600' : 'surface.hover',
              }}
            >
              Semantic Search
            </Button>
            <Button
              size="sm"
              bg={searchMode === 'fulltext' ? 'brand.500' : 'surface.card'}
              color={searchMode === 'fulltext' ? 'white' : 'fg.muted'}
              onClick={() => onSearchModeChange('fulltext')}
              borderRadius="0"
              _hover={{
                bg: searchMode === 'fulltext' ? 'brand.600' : 'surface.hover',
              }}
            >
              Full-Text Search
            </Button>
          </Flex>
          <Box
            as="select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            px={3}
            py={2}
            border="1px solid"
            borderColor="surface.border"
            borderRadius="md"
            bg="surface.card"
            fontSize="sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Box>
        </Flex>
        <Button
          bg="brand.500"
          color="white"
          size="lg"
          onClick={onSearch}
          disabled={isSearching || !query.trim()}
          _hover={{ bg: 'brand.600' }}
          _disabled={{ opacity: 0.6, cursor: 'not-allowed' }}
          fontWeight="600"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </Button>
      </Flex>
    </Box>
  );
}
