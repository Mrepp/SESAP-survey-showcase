export interface Demographics {
  college?: string;
  graduationYear?: string;
  major?: string;
  gender?: string;
  ethnicity?: string;
  age?: string;
  year?: string;
  [key: string]: string | undefined;
}

export interface TranscriptValidation {
  wordCount: number;
  hasQuestions: boolean;
  hasResponses: boolean;
  estimatedDuration: string;
}

export interface Transcript {
  rawText: string;
  validation: TranscriptValidation;
}

export interface InterviewMetadata {
  interviewDate: string;
  interviewer?: string;
  interviewURL?: string;
  notes?: string;
}

export interface Interview {
  id: string;
  title: string;
  demographics: Demographics;
  transcript: Transcript;
  metadata: InterviewMetadata;
  analysis?: import('./analysis').Analysis;
  embeddings?: import('./embeddings').InterviewEmbeddings;
  createdAt: string;
  updatedAt: string;
}
