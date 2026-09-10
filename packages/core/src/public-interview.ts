import type {
  Analysis,
  Interview,
  InterviewEmbeddings,
  InterviewMetadata,
  InterviewRecord,
} from '@sesap/types';

export interface PublicInterviewSources {
  transcript: string;
  analysis: Analysis;
  embeddings?: InterviewEmbeddings;
}

/** Word-count heuristics the showcase displays alongside a transcript. */
export function validateTranscriptText(transcript: string): Interview['transcript']['validation'] {
  const words = transcript.split(/\s+/).filter(Boolean);
  return {
    wordCount: words.length,
    hasQuestions: transcript.includes('?'),
    hasResponses: words.length > 50,
    estimatedDuration: `${Math.round(words.length / 150)} minutes`,
  };
}

/**
 * The public `Interview` document for an approved record, assembled from the
 * private record and its R2 artifacts.
 *
 * This is the only place the private record is projected into something the
 * showcase serves, and it runs at build time rather than at approve time: an
 * admin edit to an approved interview reaches the showcase on the next build
 * without anyone keeping a second copy in step.
 *
 * The submitter's email is deliberately never carried across. For a
 * self-service interview the consented attribution becomes `interviewer`.
 */
export function assemblePublicInterview(
  record: InterviewRecord,
  sources: PublicInterviewSources,
): Interview {
  const metadata: InterviewMetadata = { ...record.metadata };
  if (record.origin === 'self_service') {
    metadata.interviewer =
      record.consent?.attribution === 'named' && record.consent.displayName
        ? record.consent.displayName
        : 'Anonymous contributor';
  }

  return {
    id: record.id,
    title: record.title,
    demographics: record.demographics,
    transcript: {
      rawText: sources.transcript,
      validation: validateTranscriptText(sources.transcript),
    },
    metadata,
    video: record.video,
    analysis: sources.analysis,
    embeddings: sources.embeddings,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
