// Web Worker for generating embeddings without blocking the main thread
self.addEventListener('message', async (e) => {
  const { type, data } = e.data;
  
  if (type === 'GENERATE_EMBEDDINGS') {
    try {
      // Import transformers dynamically in the worker
      const { pipeline } = await import('https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2/dist/transformers.min.js');
      
      // Initialize the model
      const embedder = await pipeline('feature-extraction', 'Xenova/e5-base-v2');
      
      const { analysis } = data;
      const textsToEmbed = [];
      const embeddingMap = [];
      
      // Collect all texts
      analysis.summaries?.forEach((summary, idx) => {
        if (summary?.summaryText) {
          textsToEmbed.push(`query: ${summary.summaryText}`);
          embeddingMap.push({ type: 'summary', index: idx, textIndex: textsToEmbed.length - 1 });
        }
      });
      
      analysis.timelinePoints?.forEach((point, idx) => {
        if (point?.eventDescription) {
          textsToEmbed.push(`query: ${point.eventDescription}`);
          embeddingMap.push({ type: 'timelinePoint', index: idx, textIndex: textsToEmbed.length - 1 });
        }
      });
      
      analysis.themes?.forEach((theme, idx) => {
        if (theme?.description) {
          textsToEmbed.push(`query: ${theme.description}`);
          embeddingMap.push({ type: 'theme', index: idx, textIndex: textsToEmbed.length - 1 });
        }
      });
      
      analysis.quotes?.forEach((quote, idx) => {
        if (quote?.quoteText) {
          textsToEmbed.push(`query: ${quote.quoteText}`);
          embeddingMap.push({ type: 'quote', index: idx, textIndex: textsToEmbed.length - 1 });
        }
      });
      
      analysis.areasForImprovement?.forEach((area, idx) => {
        if (area?.description) {
          textsToEmbed.push(`query: ${area.description}`);
          embeddingMap.push({ type: 'improvement', index: idx, textIndex: textsToEmbed.length - 1 });
        }
      });
      
      // Generate embeddings
      const embeddings = [];
      for (const text of textsToEmbed) {
        const output = await embedder(text, { pooling: 'mean', normalize: true });
        embeddings.push(Array.from(output.data));
      }
      
      // Map back to analysis structure
      const updatedAnalysis = JSON.parse(JSON.stringify(analysis));
      
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
          case 'improvement':
            if (updatedAnalysis.areasForImprovement?.[index]) {
              updatedAnalysis.areasForImprovement[index].embedding = embedding;
            }
            break;
        }
      });
      
      self.postMessage({ type: 'SUCCESS', data: updatedAnalysis });
    } catch (error) {
      self.postMessage({ type: 'ERROR', error: error.message, stack: error.stack });
    }
  }
});
