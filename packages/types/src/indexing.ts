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
  /** When the build started reading state; a dirty flag set after this is not covered by it. */
  startedAt?: string;
  interviewCount: number;
  embeddingDimension: number;
  categories: string[];
  tags: string[];
  /**
   * R2 keys of this build's artifacts, under `build/<buildId>/`. Clients fetch
   * what the manifest names rather than fixed paths, so a build is published
   * atomically by the manifest write.
   */
  artifactPaths: Record<string, string>;
  interviewIds?: string[];
}

export interface BuildDirtyState {
  isDirty: boolean;
  pendingChanges: number;
  lastChangeAt: string;
  lastChangeType: 'approve' | 'reject' | 'delete' | 'edit' | 'reprocess';
  lastBuildAt: string | null;
}
