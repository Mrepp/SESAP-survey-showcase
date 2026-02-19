import { Box, Flex, Text, Input, Textarea, Button } from '@chakra-ui/react';
import type { Quote } from '@sesap/types';
import { ArrayItemCard } from './ArrayItemCard';
import { TagInput } from './TagInput';
import { SentimentSelect } from './SentimentSelect';

interface Props {
  quotes: Quote[];
  onChange: (quotes: Quote[]) => void;
}

export function QuotesEditor({ quotes, onChange }: Props) {
  function update(index: number, updates: Partial<Quote>) {
    onChange(quotes.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  }

  function add() {
    onChange([
      ...quotes,
      {
        id: `temp_${Date.now()}`, quoteText: '', context: '', sentiment: 'neutral',
        tags: [], themeIds: [],
      },
    ]);
  }

  function remove(index: number) {
    onChange(quotes.filter((_, i) => i !== index));
  }

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Quotes ({quotes.length})
        </Text>
        <Button size="xs" colorPalette="orange" variant="outline" onClick={add}>
          + Add Quote
        </Button>
      </Flex>

      <Flex direction="column" gap={3}>
        {quotes.map((quote, i) => (
          <ArrayItemCard
            key={quote.id}
            title={quote.quoteText.slice(0, 80) || 'New quote'}
            subtitle={`${quote.sentiment} · ${quote.tags.length} tags`}
            accentColor="#d97706"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={quote.id.startsWith('temp_')}
          >
            <Flex direction="column" gap={3}>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Quote Text</Text>
                <Textarea
                  size="sm"
                  value={quote.quoteText}
                  onChange={(e) => update(i, { quoteText: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={3}
                  fontStyle="italic"
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Context</Text>
                <Textarea
                  size="sm"
                  value={quote.context}
                  onChange={(e) => update(i, { context: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                />
              </Box>

              <Flex gap={4} wrap="wrap">
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1.5}>Sentiment</Text>
                  <SentimentSelect
                    value={quote.sentiment}
                    onChange={(sentiment) => update(i, { sentiment })}
                  />
                </Box>
                <Box>
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1.5}>Significance</Text>
                  <select
                    value={quote.significanceLevel ?? ''}
                    onChange={(e) =>
                      update(i, { significanceLevel: (e.target.value || undefined) as Quote['significanceLevel'] })
                    }
                    style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '14px', border: '1px solid #e5e7eb', background: '#f1f5f9', fontFamily: 'inherit' }}
                  >
                    <option value="">Not set</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </Box>
                <Box flex={1} minW="150px">
                  <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Timestamp</Text>
                  <Input
                    size="sm"
                    value={quote.timestamp ?? ''}
                    onChange={(e) => update(i, { timestamp: e.target.value || undefined })}
                    bg="surface.input" border="1px solid" borderColor="gray.200"
                    placeholder="e.g., 12:34"
                  />
                </Box>
              </Flex>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Tags</Text>
                <TagInput
                  value={quote.tags}
                  onChange={(tags) => update(i, { tags })}
                  placeholder="Add tag..."
                />
              </Box>

              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Theme IDs</Text>
                <TagInput
                  value={quote.themeIds}
                  onChange={(themeIds) => update(i, { themeIds })}
                  placeholder="Add theme ID..."
                />
              </Box>
            </Flex>
          </ArrayItemCard>
        ))}
      </Flex>
    </Box>
  );
}
