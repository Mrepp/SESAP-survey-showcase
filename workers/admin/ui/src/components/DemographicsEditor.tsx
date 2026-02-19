import { Box, Flex, Text, Input } from '@chakra-ui/react';
import type { Demographics } from '@sesap/types';

interface Props {
  demographics: Demographics;
  onChange: (d: Demographics) => void;
}

const fields: { key: string; label: string; required?: boolean }[] = [
  { key: 'college', label: 'College/Institution', required: true },
  { key: 'graduationYear', label: 'Graduation Year', required: true },
  { key: 'major', label: 'Major', required: true },
  { key: 'gender', label: 'Gender' },
  { key: 'ethnicity', label: 'Ethnicity' },
  { key: 'age', label: 'Age' },
  { key: 'year', label: 'Year' },
];

export function DemographicsEditor({ demographics, onChange }: Props) {
  function update(key: string, value: string) {
    onChange({ ...demographics, [key]: value });
  }

  return (
    <Flex direction="column" gap={4}>
      <Flex wrap="wrap" gap={4}>
        {fields.map((f) => (
          <Box key={f.key} minW="200px" flex="1 1 200px">
            <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1} textTransform="uppercase" letterSpacing="0.05em">
              {f.label} {f.required && <Text as="span" color="red.400">*</Text>}
            </Text>
            <Input
              size="sm"
              value={(demographics[f.key] as string) ?? ''}
              onChange={(e) => update(f.key, e.target.value)}
              bg="surface.input"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'brand.500' }}
            />
          </Box>
        ))}
      </Flex>
    </Flex>
  );
}
