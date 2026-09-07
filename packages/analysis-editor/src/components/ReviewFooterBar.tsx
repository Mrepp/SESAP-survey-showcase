'use client';

import type { ReactNode } from 'react';
import { Box, Flex, Button, Text } from '@chakra-ui/react';

export interface ReviewFooterBarProps {
  isDirty: boolean;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
  /** Label for the back button. Defaults to the admin's "Dashboard". */
  backLabel?: string;
  /**
   * Moderation actions. Each is omitted for editors that do not moderate — the
   * submitter-facing editor passes none of them.
   */
  canApprove?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onDelete?: () => void;
  /**
   * Extra buttons for the right-hand group, for editors whose primary action is
   * not approval — the submitter's "send to the program", for instance.
   */
  extraActions?: ReactNode;
}

export function ReviewFooterBar({
  isDirty,
  saving,
  onSave,
  onBack,
  backLabel = 'Dashboard',
  canApprove = false,
  onApprove,
  onReject,
  onDelete,
  extraActions,
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
            &larr; {backLabel}
          </Button>
          {onDelete && (
            <Button
              colorPalette="red"
              variant="ghost"
              size="sm"
              onClick={onDelete}
              disabled={saving}
            >
              Delete
            </Button>
          )}
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
          {extraActions}
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
              {onReject && (
                <Button
                  colorPalette="red"
                  variant="outline"
                  size="sm"
                  onClick={onReject}
                  disabled={saving}
                >
                  Reject
                </Button>
              )}
              {onApprove && (
                <Button
                  colorPalette="green"
                  size="sm"
                  onClick={onApprove}
                  disabled={isDirty || saving}
                  title={isDirty ? 'Save changes before approving' : undefined}
                >
                  Approve
                </Button>
              )}
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
