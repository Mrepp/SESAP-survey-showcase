import { Flex } from '@chakra-ui/react';

const sentiments = [
  { value: 'positive', label: 'Positive', color: '#16a34a', bg: '#dcfce7' },
  { value: 'negative', label: 'Negative', color: '#dc2626', bg: '#fee2e2' },
  { value: 'neutral', label: 'Neutral', color: '#6b7280', bg: '#f3f4f6' },
  { value: 'mixed', label: 'Mixed', color: '#7c3aed', bg: '#ede9fe' },
] as const;

type Sentiment = (typeof sentiments)[number]['value'];

interface SentimentSelectProps {
  value: Sentiment;
  onChange: (value: Sentiment) => void;
}

export function SentimentSelect({ value, onChange }: SentimentSelectProps) {
  return (
    <Flex gap={1.5} wrap="wrap">
      {sentiments.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange(s.value)}
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: `2px solid ${value === s.value ? s.color : 'transparent'}`,
            background: value === s.value ? s.bg : '#f9fafb',
            color: value === s.value ? s.color : '#6b7280',
          }}
        >
          {s.label}
        </button>
      ))}
    </Flex>
  );
}
