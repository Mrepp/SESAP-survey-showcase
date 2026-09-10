import type { InterviewRecord } from '@sesap/types';

/**
 * How long a run may sit in `processing`/`transcribing` before it counts as
 * stuck. One number, used by monitoring to flag a record, by the admin retry
 * route to allow re-queueing it, and by processing to refuse a duplicate run
 * that arrives while the first is still inside this window.
 */
export const STUCK_AFTER_MS = 10 * 60 * 1000;

export type InFlightProcessingStatus = 'processing' | 'transcribing';

export function isProcessingInFlight(record: InterviewRecord): boolean {
  return record.processing.status === 'processing' || record.processing.status === 'transcribing';
}

/** In flight and started longer ago than {@link STUCK_AFTER_MS}. */
export function isProcessingStuck(record: InterviewRecord, now = Date.now()): boolean {
  if (!isProcessingInFlight(record)) return false;
  const startedAt = record.processing.startedAt;
  // No start time at all means the run never wrote its first status; treat as stuck.
  if (!startedAt) return true;
  return now - Date.parse(startedAt) >= STUCK_AFTER_MS;
}
