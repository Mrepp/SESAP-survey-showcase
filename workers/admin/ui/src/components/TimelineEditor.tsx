import { Box, Flex, Text, Input, Textarea, Button } from '@chakra-ui/react';
import type { TimelinePoint } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';

interface Props {
  timeline: TimelinePoint[];
  onChange: (timeline: TimelinePoint[]) => void;
}

export function TimelineEditor({ timeline, onChange }: Props) {
  function update(index: number, updates: Partial<TimelinePoint>) {
    onChange(timeline.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  }

  function add() {
    onChange([
      ...timeline,
      { id: `temp_${Date.now()}`, event: '', period: '', significance: '' },
    ]);
  }

  function remove(index: number) {
    onChange(timeline.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Timeline ({timeline.length})
        </Text>
        <Button size="xs" colorPalette="purple" variant="outline" onClick={add}>
          + Add Event
        </Button>
      </Flex>

      <Flex direction="column" gap={3}>
        {timeline.map((point, i) => (
          <ArrayItemCard
            key={point.id}
            title={point.event.slice(0, 80) || 'New event'}
            subtitle={point.period}
            accentColor="#8b5cf6"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={point.id.startsWith('temp_')}
          >
            <Flex direction="column" gap={3}>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Event</Text>
                <Textarea
                  size="sm"
                  value={point.event}
                  onChange={(e) => update(i, { event: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                />
              </Box>
              <Flex gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Period</Text>
                  <Input
                    size="sm"
                    value={point.period}
                    onChange={(e) => update(i, { period: e.target.value })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="e.g., Freshman Year"
                  />
                </Box>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Significance</Text>
                  <Input
                    size="sm"
                    value={point.significance}
                    onChange={(e) => update(i, { significance: e.target.value })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="e.g., Turning point"
                  />
                </Box>
              </Flex>
            </Flex>
          </ArrayItemCard>
        ))}
      </Flex>
    </Box>
  );
}
