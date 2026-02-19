import { useState, type KeyboardEvent } from 'react';
import { Flex, Input, Text } from '@chakra-ui/react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ value, onChange, placeholder = 'Add tag...' }: TagInputProps) {
  const [input, setInput] = useState('');

  function addTag(tag: string) {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  }

  function removeTag(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      removeTag(value.length - 1);
    }
  }

  return (
    <Flex
      wrap="wrap"
      gap={1.5}
      p={2}
      bg="surface.input"
      borderRadius="md"
      border="1px solid"
      borderColor="gray.200"
      _focusWithin={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
      minH="40px"
      alignItems="center"
    >
      {value.map((tag, i) => (
        <Flex
          key={`${tag}-${i}`}
          alignItems="center"
          gap={1}
          bg="brand.100"
          color="brand.800"
          px={2}
          py={0.5}
          borderRadius="full"
          fontSize="sm"
        >
          <Text fontSize="xs" fontWeight="500">{tag}</Text>
          <button
            type="button"
            onClick={() => removeTag(i)}
            style={{
              cursor: 'pointer',
              fontSize: '12px',
              opacity: 0.6,
              lineHeight: 1,
              marginLeft: '2px',
              background: 'none',
              border: 'none',
              padding: 0,
              color: 'inherit',
            }}
          >
            &times;
          </button>
        </Flex>
      ))}
      <Input
        variant="flushed"
        size="sm"
        flex={1}
        minW="80px"
        border="none"
        placeholder={value.length === 0 ? placeholder : ''}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => input && addTag(input)}
      />
    </Flex>
  );
}
