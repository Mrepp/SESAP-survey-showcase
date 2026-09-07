/**
 * The consent and release language a contributor agrees to before uploading.
 *
 * TODO(content): this is placeholder wording pending the real consent/release
 * text from the program. When it lands, replace `CONSENT_TEXT` and bump
 * `CONSENT_VERSION` — never edit the text of a version that has been shown to
 * anyone, because archived `ConsentRecord`s reference it by version and hash.
 */
export const CONSENT_VERSION = 'draft-2026-09-01';

export const CONSENT_TEXT = `PLACEHOLDER — NOT LEGAL TEXT.

By submitting this interview you confirm that:

1. You are the person speaking in the recording, and you are sharing it
   voluntarily.
2. You grant Oregon State University a non-exclusive licence to store,
   transcribe, analyze and publish this interview as part of the SESAP survey
   showcase.
3. You understand the transcript and an AI-generated analysis of it will be
   published, and that you will be given the chance to review and correct that
   analysis before it goes live.
4. You may ask for your interview to be withdrawn at any time by contacting
   the program.

Your email address is used only to verify you and to send you your review
link. It is never published.`;

/**
 * The attribution question, asked as its own affirmative choice with neither
 * option pre-selected.
 */
export const ATTRIBUTION_PROMPT = {
  question: 'How would you like this interview credited?',
  named: 'Credit this interview to my name',
  anonymous: 'Publish anonymously',
} as const;
