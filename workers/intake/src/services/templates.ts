import type { OutboundEmail } from './mailer';

/**
 * Transactional email copy. Deliberately plain and short: these are one-action
 * messages, and everything they say has to hold whether or not the reader has
 * any context.
 */

export function verificationCodeEmail(to: string, code: string, ttlMinutes: number): OutboundEmail {
  return {
    to,
    subject: `Your SESAP verification code: ${code}`,
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
      'We have transcribed it and drafted an analysis — themes, quotes, a',
      'timeline and a summary. Before anything is published, it is yours to',
      'correct. Nothing goes into the public repository until you submit it and',
      'a program administrator approves it.',
      '',
      `Review and edit your interview: ${reviewUrl}`,
      '',
      `This link works for ${days} days and only for you. Please do not forward it.`,
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
      'A program administrator has asked for a change before your interview is',
      'published.',
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
    subject: 'Your SESAP interview has been published',
    text: [
      'Your interview has been approved and is now part of the SESAP survey',
      'showcase.',
      '',
      `See it here: ${showcaseUrl}`,
      '',
      'If you would like it withdrawn, reply to this message and we will remove',
      'it.',
    ].join('\n'),
  };
}
