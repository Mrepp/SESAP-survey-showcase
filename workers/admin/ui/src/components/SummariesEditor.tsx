import { Box, Flex, Text, Textarea, Button } from '@chakra-ui/react';
import type { Summary } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';
import { NativeSelect } from './NativeSelect';

const CATEGORIES = [
  'academic', 'social', 'personal', 'career', 'financial',
  'campus_life', 'mental_health', 'diversity', 'extracurricular', 'other',
];

interface Props {
  summaries: Summary[];
  onChange: (summaries: Summary[]) => void;
}

export function SummariesEditor({ summaries, onChange }: Props) {
  function update(index: number, updates: Partial<Summary>) {
    onChange(summaries.map((s, i) => (i === index ? { ...s, ...updates } : s)));
  }

  function add() {
    onChange([
      ...summaries,
      { id: `temp_${Date.now()}`, summaryText: '', category: 'other', confidence: 0.8 },
    ]);
  }

  function remove(index: number) {
    onChange(summaries.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Summaries ({summaries.length})
        </Text>
        <Button size="xs" colorPalette="blue" variant="outline" onClick={add}>
          + Add Summary
        </Button>
      </Flex>

      <Flex direction="column" gap={3}>
        {summaries.map((summary, i) => (
          <ArrayItemCard
            key={summary.id}
            title={summary.summaryText.slice(0, 80) || 'New summary'}
            subtitle={summary.category}
            accentColor="#3b82f6"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={summary.id.startsWith('temp_')}
          >
            <Flex direction="column" gap={3}>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Category</Text>
                <NativeSelect value={summary.category} onChange={(v) => update(i, { category: v })}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                  ))}
                </NativeSelect>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Summary Text</Text>
                <Textarea
                  size="sm"
                  value={summary.summaryText}
                  onChange={(e) => update(i, { summaryText: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={3}
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                  Confidence ({(summary.confidence * 100).toFixed(0)}%)
                </Text>
                <input
                  type="range"
                  min={0} max={100} step={1}
                  value={Math.round(summary.confidence * 100)}
                  onChange={(e) => update(i, { confidence: Number(e.target.value) / 100 })}
                  style={{ width: '100%' }}
                />
              </Box>
            </Flex>
          </ArrayItemCard>
        ))}
      </Flex>
    </Box>
  );
}
