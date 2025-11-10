import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';
import { Analysis } from '../types/interview';

let embedder: FeatureExtractionPipeline | null = null;

export async function initEmbedder() {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/e5-base-v2');
  }
  return embedder;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const model = await initEmbedder();

  // Prefix for e5 models
  const prefixedTexts = texts.map(text => `query: ${text}`);

  const embeddings = await Promise.all(
    prefixedTexts.map(async (text) => {
      const output = await model(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data) as number[];
    })
  );

  return embeddings;
}

export async function embedInterviewData(analysis: Analysis): Promise<Analysis> {
  if (!analysis) {
    throw new Error('Analysis is null or undefined');
  }

  const textsToEmbed: string[] = [];
  const embeddingMap: { type: string; index: number; textIndex: number }[] = [];

  // Collect all summaries
  analysis.summaries?.forEach((summary, idx) => {
    if (summary?.summaryText) {
      textsToEmbed.push(summary.summaryText);
      embeddingMap.push({ type: 'summary', index: idx, textIndex: textsToEmbed.length - 1 });
    }
  });

  // Collect all timeline points
  analysis.timelinePoints?.forEach((point, idx) => {
    if (point?.eventDescription) {
      textsToEmbed.push(point.eventDescription);
      embeddingMap.push({ type: 'timelinePoint', index: idx, textIndex: textsToEmbed.length - 1 });
    }
  });

  // Collect all themes (combine title + description)
  analysis.themes?.forEach((theme, idx) => {
    const combinedText = `${theme?.title || ''} ${theme?.description || ''}`.trim();
    if (combinedText) {
      textsToEmbed.push(combinedText);
      embeddingMap.push({ type: 'theme', index: idx, textIndex: textsToEmbed.length - 1 });
    }
  });

  // Collect all quotes
  analysis.quotes?.forEach((quote, idx) => {
    if (quote?.quoteText) {
      textsToEmbed.push(quote.quoteText);
      embeddingMap.push({ type: 'quote', index: idx, textIndex: textsToEmbed.length - 1 });
    }
  });

  // Collect all areas for improvement (combine title + description)
  analysis.areasForImprovement?.forEach((area, idx) => {
    const combinedText = `${area?.title || ''} ${area?.description || ''}`.trim();
    if (combinedText) {
      textsToEmbed.push(combinedText);
      embeddingMap.push({ type: 'area', index: idx, textIndex: textsToEmbed.length - 1 });
    }
  });

  if (textsToEmbed.length === 0) {
    return analysis;
  }

  // Generate all embeddings at once
  const embeddings = await generateEmbeddings(textsToEmbed);

  // Create a deep copy of analysis
  const updatedAnalysis: Analysis = JSON.parse(JSON.stringify(analysis));

  // Map embeddings back to their respective objects
  embeddingMap.forEach(({ type, index, textIndex }) => {
    const embedding = embeddings[textIndex];

    switch (type) {
      case 'summary':
        if (updatedAnalysis.summaries?.[index]) {
          updatedAnalysis.summaries[index].embedding = embedding;
        }
        break;
      case 'timelinePoint':
        if (updatedAnalysis.timelinePoints?.[index]) {
          updatedAnalysis.timelinePoints[index].embedding = embedding;
        }
        break;
      case 'theme':
        if (updatedAnalysis.themes?.[index]) {
          updatedAnalysis.themes[index].embedding = embedding;
        }
        break;
      case 'quote':
        if (updatedAnalysis.quotes?.[index]) {
          updatedAnalysis.quotes[index].embedding = embedding;
        }
        break;
      case 'area':
        if (updatedAnalysis.areasForImprovement?.[index]) {
          updatedAnalysis.areasForImprovement[index].embedding = embedding;
        }
        break;
    }
  });

  return updatedAnalysis;
}
