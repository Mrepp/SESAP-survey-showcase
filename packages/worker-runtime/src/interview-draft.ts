import { R2_PATHS } from '@sesap/types';
import type { Analysis, InterviewDraft, InterviewRecord } from '@sesap/types';
import { currentPromptStamp, generateItemId } from '@sesap/core';

interface DraftBucket {
  put(
    key: string,
    value: string,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
}

/** Item-type tags for editor-minted ids; `analysis/<id>.json` items keep whatever they had. */
const EDITOR_ITEM_TYPES = {
  summaries: 'sum',
  timeline: 'tl',
  themes: 'thm',
  quotes: 'qt',
  areasForImprovement: 'afi',
} as const;

/**
 * Apply one `InterviewDraft` to a record and its analysis object.
 *
 * Both editors — admin's and the submitter's — save the same shape through
 * this one function: editor-minted `temp_` ids are replaced with real ones, a
 * hand-edited analysis is stamped current, and only the slices present in the
 * draft are touched. The caller persists the record (each worker writes KV its
 * own way) and decides what a change means for the published build.
 */
export async function applyInterviewDraft(
  bucket: DraftBucket,
  record: InterviewRecord,
  draft: InterviewDraft,
): Promise<{ analysis?: Analysis }> {
  let savedAnalysis: Analysis | undefined;

  if (draft.analysis) {
    const analysis = draft.analysis;
    for (const [collection, type] of Object.entries(EDITOR_ITEM_TYPES)) {
      const items = analysis[collection as keyof typeof EDITOR_ITEM_TYPES] as { id: string }[];
      items.forEach((item, index) => {
        if (item.id.startsWith('temp_')) item.id = generateItemId(record.id, type, index);
      });
    }

    // A hand-edited analysis is current by definition.
    analysis.promptVersion = currentPromptStamp.promptVersion;
    analysis.promptHash = currentPromptStamp.promptHash;
    analysis.schemaVersion = currentPromptStamp.schemaVersion;

    await bucket.put(R2_PATHS.analysis(record.id), JSON.stringify(analysis), {
      httpMetadata: { contentType: 'application/json' },
    });
    record.analysisStamp = { ...currentPromptStamp };
    savedAnalysis = analysis;
  }

  if (draft.title !== undefined) record.title = draft.title;
  if (draft.demographics) record.demographics = draft.demographics;
  if (draft.metadata) record.metadata = draft.metadata;
  record.updatedAt = new Date().toISOString();

  return { analysis: savedAnalysis };
}
