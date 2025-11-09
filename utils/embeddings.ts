import { pipeline } from '@xenova/transformers';

let embedder: any = null;

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
      return Array.from(output.data);
    })
  );
  
  return embeddings;
}

export async function embedInterviewData(data: any): Promise<{ [key: string]: number[] }> {
  const textsToEmbed: { key: string; text: string }[] = [];
  
  // Extract key elements to embed
  if (data.sentiment) {
    textsToEmbed.push({ key: 'sentiment', text: data.sentiment });
  }
  
  if (data.painPoints && Array.isArray(data.painPoints)) {
    data.painPoints.forEach((point: string, idx: number) => {
      textsToEmbed.push({ key: `painPoint_${idx}`, text: point });
    });
  }
  
  if (data.positiveAspects && Array.isArray(data.positiveAspects)) {
    data.positiveAspects.forEach((aspect: string, idx: number) => {
      textsToEmbed.push({ key: `positiveAspect_${idx}`, text: aspect });
    });
  }
  
  if (textsToEmbed.length === 0) {
    return {};
  }
  
  const texts = textsToEmbed.map(t => t.text);
  const embeddings = await generateEmbeddings(texts);
  
  const result: { [key: string]: number[] } = {};
  textsToEmbed.forEach((item, idx) => {
    result[item.key] = embeddings[idx];
  });
  
  return result;
}