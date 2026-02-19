import { Flex } from '@chakra-ui/react';

const priorities = [
  { value: 'high', label: 'High', color: '#dc2626', bg: '#fee2e2' },
  { value: 'medium', label: 'Medium', color: '#d97706', bg: '#fef3c7' },
  { value: 'low', label: 'Low', color: '#16a34a', bg: '#dcfce7' },
] as const;

type Priority = (typeof priorities)[number]['value'];

interface PrioritySelectProps {
  value: Priority;
  onChange: (value: Priority) => void;
}

export function PrioritySelect({ value, onChange }: PrioritySelectProps) {
  return (
    <Flex gap={1.5}>
      {priorities.map((p) => (
        <button
          key={p.value}
          type="button"
          onClick={() => onChange(p.value)}
          style={{
            padding: '4px 12px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
            border: `2px solid ${value === p.value ? p.color : 'transparent'}`,
            background: value === p.value ? p.bg : '#f9fafb',
            color: value === p.value ? p.color : '#6b7280',
          }}
        >
          {p.label}
        </button>
      ))}
    </Flex>
  );
}
