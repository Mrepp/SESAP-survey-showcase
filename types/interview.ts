export interface Interview {
  id: string;
  rawTranscript: string;
  originalJson: any;
  editedJson?: any;
  status: 'pending' | 'in-progress' | 'completed';
  helpfulnessScore?: number;
  diffScore?: number;
  embeddings?: {
    [key: string]: number[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface QueueStats {
  pending: number;
  completed: number;
}