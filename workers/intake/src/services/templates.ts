import type { OutboundEmail } from './mailer';

/**
 * Transactional email copy. Deliberately plain and short: these are one-action
 * messages, and everything they say has to hold whether or not the reader has
 * any context.
 */

export function verificationCodeEmail(to: string, code: string, ttlMinutes: number): OutboundEmail {
  return {
    to,
    // The code stays out of the Subject. A subject line is a credential in a
    // header: it shows in lock-screen previews, notification banners and
    // mailbox list views, all of which are readable without unlocking the
    // device the mail was sent to prove control of.
    subject: 'Your SESAP verification code',
    text: [
      `Your verification code is ${code}.`,
      '',
      `It expires in ${ttlMinutes} minutes.`,
      '',
      'If you did not ask to share an interview with SESAP, you can ignore this',
      'message — nothing has been created.',
    ].join('\n'),
  };
}

export function analysisReadyEmail(to: string, reviewUrl: string, days: number): OutboundEmail {
  return {
    to,
    subject: 'Your SESAP interview is ready for you to review',
    text: [
      'Thanks for sharing your interview.',
      '',
      'We have transcribed your recording and drafted a description and',
      'analysis. You can review and correct the draft before the SESAP team',
      'decides whether to publish it. The transcript is available to read;',
      'contact the team if it needs a correction.',
      '',
      `Review and edit your interview: ${reviewUrl}`,
      '',
      `This private link works for ${days} days. Please do not forward it.`,
    ].join('\n'),
  };
}

export function revisionRequestedEmail(
  to: string,
  reviewUrl: string,
  reason: string,
  days: number,
): OutboundEmail {
  return {
    to,
    subject: 'A change was requested on your SESAP interview',
    text: [
      'The SESAP team has asked for a change before deciding whether to',
      'publish your interview.',
      '',
      `What they said: ${reason}`,
      '',
      `Make your edits and resubmit: ${reviewUrl}`,
      '',
      `This link works for ${days} days.`,
    ].join('\n'),
  };
}

export function approvedEmail(to: string, showcaseUrl: string): OutboundEmail {
  return {
    to,
    subject: 'Your SESAP interview was approved',
    text: [
      'The SESAP team approved your interview for the SESAP site.',
      '',
      'The public site may take a little time to update. Once it does, you can',
      `find your interview here: ${showcaseUrl}`,
      '',
      'If you have a question or need to request a change, reply to this message.',
    ].join('\n'),
  };
}

export function rejectedBeforeAnalysisEmail(to: string, reason: string): OutboundEmail {
  return {
    to,
    subject: 'Your SESAP interview submission was not accepted',
    text: [
      'Thank you for offering to share an interview with SESAP.', '',
      'The SESAP team reviewed your recording and cannot accept it for analysis.', '',
      `Reason: ${reason}`, '',
      'The submitted media has been deleted. No transcription or AI analysis was performed.',
    ].join('\n'),
  };
}
