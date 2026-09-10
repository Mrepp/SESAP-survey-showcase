import type { CategoryEmbeddings, Interview } from '@sesap/types';
import { EMBEDDING_DIMENSION, averageEmbeddings, deterministicEmbedding } from './embedding';

/**
 * The category-embedding shape `workers/indexing` produces, computed from
 * fixture vectors. Mirrors `generateCategoryEmbeddings` exactly — same texts,
 * same grouping, same averaging — so an index built from these is structurally
 * identical to one built from Workers AI.
 */
export function fakeGenerateCategoryEmbeddings(
  interviews: Interview[],
  dim = EMBEDDING_DIMENSION,
): CategoryEmbeddings[] {
  const embed = (text: string) => deterministicEmbedding(text, dim);

  return interviews.map((interview) => {
    const a = interview.analysis;
    const summaryVecs = (a?.summaries ?? []).map((s) => embed(s.summaryText));
    const themeVecs = (a?.themes ?? []).map((t) => embed(`${t.title}: ${t.description}`));
    const timelineVecs = (a?.timeline ?? []).map((tp) =>
      embed(`${tp.event} (${tp.period}): ${tp.significance}`),
    );
    const quoteVecs = (a?.quotes ?? []).map((q) => embed(q.quoteText));

    const tags: Record<string, number[]> = {};
    for (const q of a?.quotes ?? []) {
      for (const tag of q.tags) {
        if (tag in tags) continue;
        tags[tag] = embed(tag);
      }
    }

    return {
      interviewId: interview.id,
      summary: summaryVecs.length ? averageEmbeddings(summaryVecs, dim) : [],
      themes: themeVecs.length ? averageEmbeddings(themeVecs, dim) : [],
      collegeExperience: timelineVecs.length ? averageEmbeddings(timelineVecs, dim) : [],
      quotes: quoteVecs.length ? averageEmbeddings(quoteVecs, dim) : [],
      tags,
    };
  });
}
