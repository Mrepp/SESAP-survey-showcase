import lunr from 'lunr';
import type { Interview, SearchDocument } from '@sesap/types';

export function buildLunrIndex(interviews: Interview[]): {
  index: object;
  documents: SearchDocument[];
} {
  const documents: SearchDocument[] = [];

  // Create search documents from interviews
  for (const interview of interviews) {
    // 1. Interview document (summary + demographics)
    const demographicsText = [
      interview.demographics.college,
      interview.demographics.graduationYear,
      interview.demographics.major,
      interview.demographics.gender,
      interview.demographics.ethnicity,
    ]
      .filter(Boolean)
      .join(' ');

    const summaryCategory =
      interview.analysis?.summaries?.[0]?.category || 'uncategorized';

    const interviewDoc: SearchDocument = {
      id: `interview:${interview.id}`,
      type: 'interview',
      interviewId: interview.id,
      title: interview.title,
      content: interview.analysis?.summaries
        ?.map((s) => s.summaryText)
        .join(' ') || '',
      demographics: demographicsText,
      category: summaryCategory,
    };
    documents.push(interviewDoc);

    // 2. Theme documents
    if (interview.analysis?.themes) {
      for (const theme of interview.analysis.themes) {
        const themeDoc: SearchDocument = {
          id: `theme:${theme.id}`,
          type: 'theme',
          interviewId: interview.id,
          title: theme.title,
          content: theme.description,
          category: theme.category,
        };
        documents.push(themeDoc);
      }
    }

    // 3. Quote documents
    if (interview.analysis?.quotes) {
      for (const quote of interview.analysis.quotes) {
        const quoteDoc: SearchDocument = {
          id: `quote:${quote.id}`,
          type: 'quote',
          interviewId: interview.id,
          title: quote.quoteText.slice(0, 50) + '...',
          content: quote.quoteText + ' ' + quote.context,
          sentiment: quote.sentiment,
          tags: quote.tags,
        };
        documents.push(quoteDoc);
      }
    }
  }

  // Build Lunr index
  const idx = lunr(function (this: lunr.Builder) {
    this.ref('id');

    // Add fields with different boost values
    this.field('title', { boost: 10 });
    this.field('content', { boost: 5 });
    this.field('demographics', { boost: 3 });
    this.field('category', { boost: 2 });
    this.field('sentiment');
    this.field('tags');

    // Add all documents
    for (const doc of documents) {
      this.add({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        demographics: doc.demographics || '',
        category: doc.category || '',
        sentiment: doc.sentiment || '',
        tags: doc.tags?.join(' ') || '',
      });
    }
  });

  // Serialize the index to a plain object
  return {
    index: idx.toJSON(),
    documents,
  };
}
