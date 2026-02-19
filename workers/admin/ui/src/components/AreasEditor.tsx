import { Box, Flex, Text, Input, Textarea, Button } from '@chakra-ui/react';
import type { AreaForImprovement } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';
import { PrioritySelect } from './PrioritySelect';
import { TagInput } from './TagInput';
import { NativeSelect } from './NativeSelect';

const CATEGORIES = [
  'academic', 'social', 'personal', 'career', 'financial',
  'campus_life', 'mental_health', 'diversity', 'extracurricular', 'other',
];

interface Props {
  areas: AreaForImprovement[];
  onChange: (areas: AreaForImprovement[]) => void;
}

export function AreasEditor({ areas, onChange }: Props) {
  function update(index: number, updates: Partial<AreaForImprovement>) {
    onChange(areas.map((a, i) => (i === index ? { ...a, ...updates } : a)));
  }

  function add() {
    onChange([
      ...areas,
      {
        id: `temp_${Date.now()}`, area: '', description: '', category: 'other',
        priority: 'medium',
      },
    ]);
  }

  function remove(index: number) {
    onChange(areas.filter((_, i) => i !== index));
  }

  function updateActionItem(areaIndex: number, itemIndex: number, value: string) {
    const area = areas[areaIndex];
    const items = [...(area.actionItems ?? [])];
    items[itemIndex] = value;
    update(areaIndex, { actionItems: items });
  }

  function addActionItem(areaIndex: number) {
    const area = areas[areaIndex];
    update(areaIndex, { actionItems: [...(area.actionItems ?? []), ''] });
  }

  function removeActionItem(areaIndex: number, itemIndex: number) {
    const area = areas[areaIndex];
    update(areaIndex, { actionItems: (area.actionItems ?? []).filter((_, i) => i !== itemIndex) });
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Areas for Improvement ({areas.length})
        </Text>
        <Button size="xs" colorPalette="red" variant="outline" onClick={add}>
          + Add Area
        </Button>
      </Flex>

      <Flex direction="column" gap={3}>
        {areas.map((area, i) => (
          <ArrayItemCard
            key={area.id}
            title={area.title || area.area || 'New area'}
            subtitle={`${area.category} · ${area.priority} priority`}
            accentColor="#e11d48"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={area.id.startsWith('temp_')}
          >
            <Flex direction="column" gap={3}>
              <Flex gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Title</Text>
                  <Input
                    size="sm"
                    value={area.title ?? ''}
                    onChange={(e) => update(i, { title: e.target.value || undefined })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="Short title"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Area</Text>
                  <Input
                    size="sm"
                    value={area.area}
                    onChange={(e) => update(i, { area: e.target.value })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                  />
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Description</Text>
                <Textarea
                  size="sm"
                  value={area.description}
                  onChange={(e) => update(i, { description: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                />
              </Box>

              <Flex gap={4} wrap="wrap" alignItems="flex-end">
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1.5}>Priority</Text>
                  <PrioritySelect
                    value={area.priority}
                    onChange={(priority) => update(i, { priority })}
                  />
                </Box>
                <Box flex={1} minW="150px">
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Category</Text>
                  <NativeSelect value={area.category} onChange={(v) => update(i, { category: v })}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                    ))}
                  </NativeSelect>
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Stakeholders</Text>
                <TagInput
                  value={area.stakeholders ?? []}
                  onChange={(stakeholders) => update(i, { stakeholders })}
                  placeholder="Add stakeholder..."
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                  Action Items ({(area.actionItems ?? []).length})
                </Text>
                <Flex direction="column" gap={2}>
                  {(area.actionItems ?? []).map((item, j) => (
                    <Flex key={j} gap={2} alignItems="center">
                      <Input
                        size="sm"
                        value={item}
                        onChange={(e) => updateActionItem(i, j, e.target.value)}
                        bg="surface.input" border="1px solid" borderColor="gray.200"
                        placeholder="Action item..."
                      />
                      <button
                        type="button"
                        onClick={() => removeActionItem(i, j)}
                        style={{
                          color: '#f87171',
                          fontSize: '14px',
                          cursor: 'pointer',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          flexShrink: 0,
                        }}
                      >
                        &times;
                      </button>
                    </Flex>
                  ))}
                  <Button size="xs" variant="ghost" onClick={() => addActionItem(i)} alignSelf="flex-start">
                    + Add action item
                  </Button>
                </Flex>
              </Box>
            </Flex>
          </ArrayItemCard>
        ))}
      </Flex>
    </Box>
  );
}
