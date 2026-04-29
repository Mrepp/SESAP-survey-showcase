import { Box, Flex, Text, Input, Textarea, Button } from '@chakra-ui/react';
import type { TimelinePoint, Term, Quote } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';
import { NativeSelect } from './NativeSelect';
import { TERM_MIDPOINTS, inferTerm } from '../lib/timelineInference';

interface Props {
  timeline: TimelinePoint[];
  onChange: (timeline: TimelinePoint[]) => void;
  quotes: Quote[];
  onQuotesChange: (quotes: Quote[]) => void;
}

const TERM_OPTIONS: Term[] = [
  'pre_college',
  'freshman_fall', 'freshman_winter', 'freshman_spring', 'freshman_summer',
  'sophomore_fall', 'sophomore_winter', 'sophomore_spring', 'sophomore_summer',
  'junior_fall', 'junior_winter', 'junior_spring', 'junior_summer',
  'senior_fall', 'senior_winter', 'senior_spring', 'senior_summer',
  'post_college',
  'unknown',
];

const SENTIMENT_COLORS: Record<Quote['sentiment'], string> = {
  positive: '#16a34a',
  negative: '#dc2626',
  neutral: '#6b7280',
  mixed: '#d97706',
};

function formatTerm(t: Term): string {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function TimelineEditor({ timeline, onChange, quotes, onQuotesChange }: Props) {
  function update(index: number, updates: Partial<TimelinePoint>) {
    onChange(timeline.map((t, i) => (i === index ? { ...t, ...updates } : t)));
  }

  // Inference runs on blur (not on each keystroke) so the term dropdown
  // doesn't flicker mid-edit. Specific term selections are never overridden.
  function inferOnBlur(index: number) {
    const point = timeline[index];
    if (point.term && point.term !== 'unknown') return;
    const inferred = inferTerm(point);
    if (inferred === (point.term ?? 'unknown')) return;
    const next: Partial<TimelinePoint> = { term: inferred };
    if (typeof point.position !== 'number') {
      next.position = TERM_MIDPOINTS[inferred];
    }
    update(index, next);
  }

  function add() {
    onChange([
      ...timeline,
      {
        id: `temp_${Date.now()}`,
        event: '',
        period: '',
        significance: '',
        term: 'unknown',
        position: 0.5,
      },
    ]);
  }

  function remove(index: number) {
    const removedId = timeline[index]?.id;
    onChange(timeline.filter((_, i) => i !== index));
    if (removedId && quotes.some((q) => q.timelineEventId === removedId)) {
      onQuotesChange(
        quotes.map((q) =>
          q.timelineEventId === removedId ? { ...q, timelineEventId: undefined } : q,
        ),
      );
    }
  }

  function linkedQuotes(eventId: string): Quote[] {
    return quotes.filter((q) => q.timelineEventId === eventId);
  }

  function availableQuotes(eventId: string): Quote[] {
    return quotes.filter((q) => !q.timelineEventId || q.timelineEventId === eventId);
  }

  function linkQuote(quoteId: string, eventId: string) {
    onQuotesChange(
      quotes.map((q) => (q.id === quoteId ? { ...q, timelineEventId: eventId } : q)),
    );
  }

  function unlinkQuote(quoteId: string) {
    onQuotesChange(
      quotes.map((q) => (q.id === quoteId ? { ...q, timelineEventId: undefined } : q)),
    );
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
        {timeline.map((point, i) => {
          const linked = linkedQuotes(point.id);
          const available = availableQuotes(point.id).filter(
            (q) => q.timelineEventId !== point.id,
          );
          return (
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
                  onBlur={() => inferOnBlur(i)}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                />
              </Box>
              <Flex gap={3}>
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Period (label)</Text>
                  <Input
                    size="sm"
                    value={point.period}
                    onChange={(e) => update(i, { period: e.target.value })}
                    onBlur={() => inferOnBlur(i)}
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
                    onBlur={() => inferOnBlur(i)}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="e.g., Turning point"
                  />
                </Box>
              </Flex>
              <Flex gap={3} alignItems="flex-end">
                <Box flex={1}>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Term</Text>
                  <NativeSelect
                    value={point.term ?? 'unknown'}
                    onChange={(value) => {
                      const term = value as Term;
                      const updates: Partial<TimelinePoint> = { term };
                      // If position is missing, seed from term midpoint.
                      if (typeof point.position !== 'number') {
                        updates.position = TERM_MIDPOINTS[term];
                      }
                      update(i, updates);
                    }}
                  >
                    {TERM_OPTIONS.map((t) => (
                      <option key={t} value={t}>{formatTerm(t)}</option>
                    ))}
                  </NativeSelect>
                </Box>
                <Box flex={1}>
                  <Flex justifyContent="space-between" alignItems="baseline" mb={1}>
                    <Text fontSize="xs" fontWeight="600" color="gray.500">
                      Position (0 = freshman start, 1 = senior end)
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {typeof point.position === 'number' ? point.position.toFixed(2) : '—'}
                    </Text>
                  </Flex>
                  <Input
                    size="sm"
                    type="number"
                    step="0.01"
                    min={-0.25}
                    max={2}
                    value={typeof point.position === 'number' ? point.position : ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      update(i, { position: v === '' ? undefined : Number(v) });
                    }}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="e.g. 0.45"
                  />
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                  Linked Quotes ({linked.length})
                </Text>
                {linked.length === 0 ? (
                  <Text fontSize="xs" color="gray.400" fontStyle="italic" mb={2}>
                    No quotes linked
                  </Text>
                ) : (
                  <Flex direction="column" gap={2} mb={2}>
                    {linked.map((q) => (
                      <Flex
                        key={q.id}
                        align="flex-start"
                        gap={2}
                        p={2}
                        bg="surface.input"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="md"
                      >
                        <Box
                          mt="4px"
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg={SENTIMENT_COLORS[q.sentiment]}
                          flexShrink={0}
                          title={q.sentiment}
                        />
                        <Text
                          flex={1}
                          fontSize="xs"
                          fontStyle="italic"
                          color="gray.700"
                          lineHeight="1.4"
                        >
                          {q.quoteText.length > 120
                            ? `${q.quoteText.slice(0, 120)}…`
                            : q.quoteText || <Text as="span" color="gray.400">(empty quote)</Text>}
                        </Text>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => unlinkQuote(q.id)}
                        >
                          × Unlink
                        </Button>
                      </Flex>
                    ))}
                  </Flex>
                )}
                {available.length > 0 && (
                  <NativeSelect
                    value=""
                    onChange={(value) => {
                      if (value) linkQuote(value, point.id);
                    }}
                  >
                    <option value="">— Link quote —</option>
                    {available.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.quoteText
                          ? q.quoteText.length > 80
                            ? `${q.quoteText.slice(0, 80)}…`
                            : q.quoteText
                          : '(empty quote)'}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </Box>
            </Flex>
          </ArrayItemCard>
          );
        })}
      </Flex>
    </Box>
  );
}
