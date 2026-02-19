export type ProcessingStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
export type ApprovalStatus = 'pending_review' | 'approved' | 'rejected';

export interface InterviewKVRecord {
  id: string;
  title: string;
  processingStatus: ProcessingStatus;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  processingError?: string;
  createdAt: string;
  updatedAt: string;
  demographics: import('./interview').Demographics;
}

export interface InterviewRecord {
  id: string;
  title: string;
  demographics: import('./interview').Demographics;
  metadata: import('./interview').InterviewMetadata;

  processing: {
    status: ProcessingStatus;
    queuedAt?: string;
    startedAt?: string;
    completedAt?: string;
    failedAt?: string;
    error?: string;
    retryCount?: number;
  };

  approval: {
    status: ApprovalStatus;
    reviewedAt?: string;
    reviewedBy?: string;
    rejectionReason?: string;
  };

  artifacts: {
    transcript: boolean;
    analysis: boolean;
    embeddings: boolean;
  };

  createdAt: string;
  updatedAt: string;
}

export interface ProcessingQueueMessage {
  interviewId: string;
  queuedAt: string;
  priority?: 'high' | 'normal';
  metadata?: {
    triggeredBy: string;
    reason: 'new_upload' | 'retry_admin' | 'retry_auto';
  };
}

export interface CreateInterviewRequest {
  title: string;
  demographics: import('./interview').Demographics;
  metadata: import('./interview').InterviewMetadata;
}
