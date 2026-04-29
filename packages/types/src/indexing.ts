export interface VectorIndexEntry {
  id: string;
  index: number;
  embedding: number[];
}

export interface VectorIndices {
  summary: VectorIndexEntry[];
  themes: VectorIndexEntry[];
  collegeExperience: VectorIndexEntry[];
  quotes: VectorIndexEntry[];
  tags: Record<string, VectorIndexEntry[]>;
}

export interface ClusterAssignment {
  interviewIndex: number;
  interviewId: string;
  clusterId: number;
  distance: number;
}

export interface ClusterResult {
  clusterId: number;
  center: number[];
  members: ClusterAssignment[];
  cohesion: number;
}

export interface SearchDocument {
  id: string;
  type: 'interview' | 'theme' | 'quote';
  interviewId: string;
  title: string;
  content: string;
  demographics?: string;
  category?: string;
  sentiment?: string;
  tags?: string[];
}

export interface SearchEmbedding {
  id: string;
  interviewId: string;
  embedding: number[];
}

export interface SearchIndex {
  index: object;
  documents: SearchDocument[];
  embeddings: SearchEmbedding[];
}

export interface BuildMetadata {
  buildId: string;
  timestamp: string;
  interviewCount: number;
  embeddingDimension: number;
  categories: string[];
  tags: string[];
  artifactPaths: Record<string, string>;
  interviewIds?: string[];
}

export interface BuildDirtyState {
  isDirty: boolean;
  pendingChanges: number;
  lastChangeAt: string;
  lastChangeType: 'approve' | 'delete' | 'edit' | 'reprocess';
  lastBuildAt: string | null;
}
