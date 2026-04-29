import { Badge } from '@chakra-ui/react';

const statusColors: Record<string, string> = {
  pending: 'orange',
  queued: 'blue',
  processing: 'blue',
  completed: 'green',
  failed: 'red',
  pending_review: 'orange',
  approved: 'green',
  rejected: 'red',
  not_published: 'orange',
  out_of_sync: 'yellow',
};

export function StatusBadge({ status }: { status: string }) {
  const colorPalette = statusColors[status] ?? 'gray';
  return (
    <Badge
      colorPalette={colorPalette}
      variant="solid"
      px={2}
      py={0.5}
      borderRadius="full"
      fontSize="xs"
      fontWeight="600"
      textTransform="uppercase"
      letterSpacing="0.05em"
    >
      {status.replace(/_/g, ' ')}
    </Badge>
  );
}
