import type { Interview, InterviewRecord, InterviewEmbeddings } from '@sesap/types';
import { Logger, ProcessingError } from '@sesap/shared';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import type { Env } from '../bindings';

const logger = new Logger({ service: 'aggregator-service' });

/**
 * Load all approved interviews with their embeddings from KV and R2.
 *
 * Process:
 * 1. List all interview IDs from KV (interviews:list)
 * 2. Filter by approvalStatus === 'approved'
 * 3. Load each interview from R2 (interview_repository/{id}.json)
 * 4. Load embeddings from R2 (embeddings/{id}.json)
 * 5. Attach embeddings to interview objects
 */
export async function loadApprovedInterviews(env: Env): Promise<Interview[]> {
  logger.info('Loading approved interviews');

  // Step 1: Get the list of all interview IDs from KV
  const interviewListJson = await env.SESAP_KV.get(KV_KEYS.interviewsList);
  if (!interviewListJson) {
    logger.warn('No interview list found in KV');
    return [];
  }

  const interviewIds: string[] = JSON.parse(interviewListJson);
  logger.debug('Found interview IDs', { count: interviewIds.length });

  // Step 2: Load metadata for each interview and filter by approval status
  const approvedIds: string[] = [];
  for (const id of interviewIds) {
    const metaJson = await env.SESAP_KV.get(KV_KEYS.interview(id));
    if (!metaJson) {
      logger.warn('Interview metadata not found', { interviewId: id });
      continue;
    }

    const meta: InterviewRecord = JSON.parse(metaJson);
    if (meta.approval.status === 'approved') {
      approvedIds.push(id);
    }
  }

  logger.info('Filtered approved interviews', {
    total: interviewIds.length,
    approved: approvedIds.length,
  });

  // Step 3 & 4: Load interviews and embeddings from R2
  const interviews: Interview[] = [];

  for (const id of approvedIds) {
    try {
      // Load interview from R2
      const interviewObj = await env.SESAP_BUCKET.get(R2_PATHS.interview(id));
      if (!interviewObj) {
        logger.warn('Interview not found in R2', { interviewId: id });
        continue;
      }

      const interview: Interview = await interviewObj.json();

      // Load embeddings from R2
      const embeddingsObj = await env.SESAP_BUCKET.get(R2_PATHS.embeddings(id));
      if (!embeddingsObj) {
        logger.warn('Embeddings not found in R2', { interviewId: id });
        continue;
      }

      const embeddings: InterviewEmbeddings = await embeddingsObj.json();

      // Step 5: Attach embeddings to interview
      interview.embeddings = embeddings;

      interviews.push(interview);

      logger.debug('Loaded interview with embeddings', {
        interviewId: id,
        vectorCount: embeddings.vectors.length,
      });
    } catch (err) {
      throw new ProcessingError(`Failed to load interview: ${id}`, {
        interviewId: id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info('Successfully loaded approved interviews', {
    count: interviews.length,
  });

  return interviews;
}
