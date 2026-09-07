import { SHOWCASE_ROUTES } from '@sesap/types';
import type { NotificationMessage } from '@sesap/types';
import { Logger } from '@sesap/worker-runtime';
import type { Env } from '../bindings';
import { getInterview, putInterview } from './interview';
import { sendEmail } from './mailer';
import {
  analysisReadyEmail,
  approvedEmail,
  revisionRequestedEmail,
} from './templates';
import { REVIEW_TOKEN_TTL_DAYS, mintReviewToken } from './review-token';

const logger = new Logger({ worker: 'sesap-intake', module: 'notifications' });

/**
 * Handle one message off `interview-notifications`.
 *
 * No PII rides the queue: the message carries an interview id, and the
 * submitter's address is resolved from the record here — the one worker that
 * both reads it and sends mail.
 */
export async function handleNotification(env: Env, message: NotificationMessage): Promise<void> {
  const record = await getInterview(env, message.interviewId);

  // Admin-origin interviews have no submitter to notify. Producers do not know
  // an interview's origin, so filtering happens here rather than at send time.
  if (record.origin !== 'self_service' || !record.submitter?.email) {
    logger.info('Skipping notification for non-self-service interview', {
      interviewId: message.interviewId,
      kind: message.kind,
    });
    return;
  }

  const email = record.submitter.email;

  switch (message.kind) {
    case 'processed':
    case 'rejected': {
      // A review link is only ever minted for a record that is waiting on its
      // submitter. Processing reports every completion, including an admin's
      // reprocess of an approved or already-submitted interview; reopening the
      // submitter's review for those would contradict the admin's own state.
      if (record.approval.status !== 'pending_submitter_review') {
        logger.info('Skipping review link: interview is not awaiting its submitter', {
          interviewId: record.id,
          kind: message.kind,
          reason: message.reason,
          approvalStatus: record.approval.status,
        });
        return;
      }

      const { url } = await mintReviewToken(env, record);
      await putInterview(env, record);

      await sendEmail(
        env,
        message.kind === 'processed'
          ? analysisReadyEmail(email, url, REVIEW_TOKEN_TTL_DAYS)
          : revisionRequestedEmail(
              email,
              url,
              record.approval.rejectionReason ?? 'No reason given.',
              REVIEW_TOKEN_TTL_DAYS,
            ),
      );
      break;
    }

    case 'approved': {
      // The published interview lives in the showcase; intake serves no page
      // for it. `trailingSlash` is on in the showcase export, so the id rides
      // as a query param on the directory form of the route.
      const showcase = env.SHOWCASE_URL.replace(/\/+$/, '');
      await sendEmail(env, approvedEmail(email, `${showcase}${SHOWCASE_ROUTES.interviewView(record.id)}`));
      break;
    }
  }

  logger.info('Notification handled', { interviewId: record.id, kind: message.kind });
}
