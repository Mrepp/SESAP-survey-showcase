import { Box, Flex, Text, Input, Textarea, Button, Switch } from '@chakra-ui/react';
import type { Theme } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';
import { TagInput } from './TagInput';
import { NativeSelect } from './NativeSelect';

const CATEGORIES = [
  'academic', 'social', 'personal', 'career', 'financial',
  'campus_life', 'mental_health', 'diversity', 'extracurricular', 'other',
];

interface Props {
  themes: Theme[];
  onChange: (themes: Theme[]) => void;
}

export function ThemesEditor({ themes, onChange }: Props) {
  function update(index: number, updates: Partial<Theme>) {
    onChange(themes.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  }

  function add() {
    onChange([
      ...themes,
      {
        id: `temp_${Date.now()}`, title: '', description: '', category: 'other',
        frequency: 1, relatedQuoteIds: [],
      },
    ]);
  }

  function remove(index: number) {
    onChange(themes.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Themes ({themes.length})
        </Text>
        <Button size="xs" colorPalette="teal" variant="outline" onClick={add}>
          + Add Theme
        </Button>
      </Flex>

      <Flex direction="column" gap={3}>
        {themes.map((theme, i) => (
          <ArrayItemCard
            key={theme.id}
            title={theme.title || 'New theme'}
            subtitle={`${theme.category} · freq: ${theme.frequency}`}
            accentColor="#0d9488"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={theme.id.startsWith('temp_')}
          >
            <Flex direction="column" gap={3}>
              <Flex gap={3}>
                <Box flex={2}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Title</Text>
                  <Input
                    size="sm"
                    value={theme.title}
                    onChange={(e) => update(i, { title: e.target.value })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Category</Text>
                  <NativeSelect value={theme.category} onChange={(v) => update(i, { category: v })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </NativeSelect>
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Description</Text>
                <Textarea
                  size="sm"
                  value={theme.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                />
              </Box>

              <Flex gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Frequency</Text>
                  <Input
                    size="sm" type="number" min={0}
                    value={theme.frequency}
                    onChange={(e) => update(i, { frequency: Number(e.target.value) })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Impact Score (0-10)</Text>
                  <Input
                    size="sm" type="number" min={0} max={10}
                    value={theme.impactScore ?? ''}
                    onChange={(e) => update(i, { impactScore: e.target.value ? Number(e.target.value) : undefined })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                  />
                </Box>
                <Flex flex={1} alignItems="flex-end" gap={2} pb={1}>
                  <Switch.Root
                    checked={theme.actionable ?? false}
                    onCheckedChange={(e) => update(i, { actionable: e.checked })}
                  >
                    <Switch.HiddenInput />
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch.Root>
                  <Text fontSize="xs" fontWeight="600" color="gray.500">Actionable</Text>
                </Flex>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Related Quote IDs</Text>
                <TagInput
                  value={theme.relatedQuoteIds}
                  onChange={(ids) => update(i, { relatedQuoteIds: ids })}
                  placeholder="Add quote ID..."
                />
              </Box>
            </Flex>
          </ArrayItemCard>
        ))}
      </Flex>
    </Box>
  );
}
