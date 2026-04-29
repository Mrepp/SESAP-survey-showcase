import type { CategoryEmbeddings, Interview } from '@sesap/types';

export const DIM = 8;

export function deterministicEmbedding(text: string, dim = DIM): number[] {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const out: number[] = [];
  for (let i = 0; i < dim; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    out.push(((h >>> 0) % 1000) / 1000);
  }
  return out;
}

function average(vectors: number[][]): number[] {
  if (vectors.length === 0) return new Array(DIM).fill(0);
  const dim = vectors[0].length;
  const sum = new Array(dim).fill(0);
  for (const v of vectors) for (let i = 0; i < dim; i++) sum[i] += v[i];
  return sum.map((s) => s / vectors.length);
}

export function fakeGenerateCategoryEmbeddings(interviews: Interview[]): CategoryEmbeddings[] {
  return interviews.map((interview) => {
    const a = interview.analysis;
    const summaryVecs = (a?.summaries ?? []).map((s) => deterministicEmbedding(s.summaryText));
    const themeVecs = (a?.themes ?? []).map((t) => deterministicEmbedding(`${t.title}: ${t.description}`));
    const timelineVecs = (a?.timeline ?? []).map((tp) =>
      deterministicEmbedding(`${tp.event} (${tp.period}): ${tp.significance}`),
    );
    const quoteVecs = (a?.quotes ?? []).map((q) => deterministicEmbedding(q.quoteText));

    const tags: Record<string, number[]> = {};
    const seen = new Set<string>();
    for (const q of a?.quotes ?? []) {
      for (const tag of q.tags) {
        if (seen.has(tag)) continue;
        seen.add(tag);
        tags[tag] = deterministicEmbedding(tag);
      }
    }

    return {
      interviewId: interview.id,
      summary: summaryVecs.length ? average(summaryVecs) : [],
      themes: themeVecs.length ? average(themeVecs) : [],
      collegeExperience: timelineVecs.length ? average(timelineVecs) : [],
      quotes: quoteVecs.length ? average(quoteVecs) : [],
      tags,
    };
  });
}
