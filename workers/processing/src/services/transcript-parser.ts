import type { Analysis, EmbeddingType } from '@sesap/types';

export interface EmbeddableChunk {
  id: string;
  type: EmbeddingType;
  text: string;
}

export function extractChunksFromAnalysis(
  interviewId: string,
  analysis: Analysis,
): EmbeddableChunk[] {
  const chunks: EmbeddableChunk[] = [];

  for (const summary of analysis.summaries) {
    chunks.push({
      id: summary.id,
      type: 'summary',
      text: `${summary.category}: ${summary.summaryText}`,
    });
  }

  for (const theme of analysis.themes) {
    chunks.push({
      id: theme.id,
      type: 'theme',
      text: `${theme.title}: ${theme.description}`,
    });
  }

  for (const quote of analysis.quotes) {
    chunks.push({
      id: quote.id,
      type: 'quote',
      text: quote.quoteText,
    });
  }

  for (const point of analysis.timeline) {
    chunks.push({
      id: point.id,
      type: 'timeline',
      text: `${point.period} - ${point.event}: ${point.significance}`,
    });
  }

  for (const area of analysis.areasForImprovement) {
    chunks.push({
      id: area.id,
      type: 'areaForImprovement',
      text: `${area.area}: ${area.description}`,
    });
  }

  return chunks;
}

export function parseTranscript(
  interviewId: string,
  transcript: string,
): EmbeddableChunk[] {
  // Split transcript into paragraph-level chunks for raw embedding
  const paragraphs = transcript
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  return paragraphs.map((text, index) => ({
    id: `${interviewId}_raw_${index}`,
    type: 'summary' as EmbeddingType,
    text,
  }));
}
