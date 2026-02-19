export type EmbeddingType = 'summary' | 'theme' | 'quote' | 'timeline' | 'areaForImprovement';

export interface EmbeddingVector {
  id: string;
  type: EmbeddingType;
  text: string;
  embedding: number[];
  dimension: number;
}

export interface InterviewEmbeddings {
  interviewId: string;
  model: string;
  dimension: number;
  vectors: EmbeddingVector[];
  generatedAt: string;
}

export interface CategoryEmbeddings {
  interviewId: string;
  summary: number[];
  themes: number[];
  collegeExperience: number[];
  quotes: number[];
  tags: Record<string, number[]>;
}

export interface TagEmbeddings {
  tag: string;
  interviewIds: string[];
  embedding: number[];
}
