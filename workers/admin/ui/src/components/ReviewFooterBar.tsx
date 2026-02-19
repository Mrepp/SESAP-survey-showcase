import { Box, Flex, Button, Text } from '@chakra-ui/react';

interface ReviewFooterBarProps {
  isDirty: boolean;
  saving: boolean;
  canApprove: boolean;
  onSave: () => void;
  onApprove: () => void;
  onReject: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function ReviewFooterBar({
  isDirty,
  saving,
  canApprove,
  onSave,
  onApprove,
  onReject,
  onDelete,
  onBack,
}: ReviewFooterBarProps) {
  return (
    <Box
      position="sticky"
      bottom={0}
      bg="whiteAlpha.900"
      backdropFilter="blur(12px)"
      borderTop="1px solid"
      borderColor="gray.200"
      px={6}
      py={3}
      zIndex={10}
    >
      <Flex maxW="1400px" mx="auto" alignItems="center" justifyContent="space-between">
        <Flex alignItems="center" gap={3}>
          <Button variant="ghost" size="sm" onClick={onBack}>
            &larr; Dashboard
          </Button>
          <Button
            colorPalette="red"
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={saving}
          >
            Delete
          </Button>
          {isDirty && (
            <Flex alignItems="center" gap={1.5}>
              <Box w={2} h={2} borderRadius="full" bg="accent.dirty" />
              <Text fontSize="xs" color="accent.dirty" fontWeight="600">
                Unsaved changes
              </Text>
            </Flex>
          )}
        </Flex>

        <Flex gap={3}>
          {isDirty && (
            <Button
              colorPalette="blue"
              size="sm"
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Corrections'}
            </Button>
          )}
          {canApprove && (
            <>
              <Button
                colorPalette="red"
                variant="outline"
                size="sm"
                onClick={onReject}
                disabled={saving}
              >
                Reject
              </Button>
              <Button
                colorPalette="green"
                size="sm"
                onClick={onApprove}
                disabled={isDirty || saving}
                title={isDirty ? 'Save changes before approving' : undefined}
              >
                Approve
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
