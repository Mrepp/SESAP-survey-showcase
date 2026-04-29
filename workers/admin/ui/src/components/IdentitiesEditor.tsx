import { Box, Flex, Text, Textarea, Button } from '@chakra-ui/react';
import type { Identity } from '@sesap/types';
import { IDENTITY_LABELS } from '@sesap/shared';
import { ArrayItemCard } from './ArrayItemCard';
import { NativeSelect } from './NativeSelect';

interface Props {
  identities: Identity[];
  onChange: (identities: Identity[]) => void;
}

export function IdentitiesEditor({ identities, onChange }: Props) {
  function update(index: number, updates: Partial<Identity>) {
    onChange(identities.map((it, i) => (i === index ? { ...it, ...updates } : it)));
  }

  function add() {
    const used = new Set(identities.map((i) => i.label));
    const next = IDENTITY_LABELS.find((l) => !used.has(l)) ?? IDENTITY_LABELS[0];
    onChange([
      ...identities,
      { label: next, confidence: 0.8, evidence: '' },
    ]);
  }

  function remove(index: number) {
    onChange(identities.filter((_, i) => i !== index));
  }

  const unselected = IDENTITY_LABELS.filter(
    (label) => !identities.some((i) => i.label === label),
  );

  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700">
          Identities ({identities.length})
        </Text>
        <Button
          size="xs"
          colorPalette="teal"
          variant="outline"
          onClick={add}
          disabled={unselected.length === 0}
        >
          + Add Identity
        </Button>
      </Flex>

      <Text fontSize="xs" color="gray.500" mb={3}>
        Only assert identities directly supported by the transcript (self-identification or
        unambiguous statement). Evidence should be a brief verbatim quote or paraphrase.
      </Text>

      <Flex direction="column" gap={3}>
        {identities.length === 0 && (
          <Box bg="gray.50" border="1px dashed" borderColor="gray.300" p={4} borderRadius="md">
            <Text fontSize="sm" color="gray.500">
              No identities asserted for this interview. This is expected when the transcript
              doesn't directly support any of the canonical identity labels.
            </Text>
          </Box>
        )}

        {identities.map((identity, i) => (
          <ArrayItemCard
            key={`${identity.label}-${i}`}
            title={identity.label}
            subtitle={identity.evidence.slice(0, 80)}
            accentColor="#0d9488"
            index={i}
            onRemove={() => remove(i)}
            defaultExpanded={!identity.evidence}
          >
            <Flex direction="column" gap={3}>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>Identity Label</Text>
                <NativeSelect
                  value={identity.label}
                  onChange={(v) => update(i, { label: v })}
                >
                  {IDENTITY_LABELS.map((label) => (
                    <option key={label} value={label}>{label}</option>
                  ))}
                </NativeSelect>
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                  Evidence (verbatim quote or close paraphrase)
                </Text>
                <Textarea
                  size="sm"
                  value={identity.evidence}
                  onChange={(e) => update(i, { evidence: e.target.value })}
                  bg="surface.input" border="1px solid" borderColor="gray.200"
                  rows={2}
                  placeholder="e.g., I'm the first in my family to go to college"
                />
              </Box>
              <Box>
                <Text fontSize="xs" fontWeight="600" color="gray.500" mb={1}>
                  Confidence ({(identity.confidence * 100).toFixed(0)}%)
                </Text>
                <input
                  type="range"
                  min={0} max={100} step={1}
                  value={Math.round(identity.confidence * 100)}
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
