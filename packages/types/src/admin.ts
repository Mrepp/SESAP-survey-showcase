export type ProcessingStatus =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'processing'
  | 'completed'
  | 'failed';
export type ApprovalStatus = 'pending_review' | 'approved' | 'rejected';

export type InterviewSource = 'transcript' | 'audio' | 'kaltura';

export interface AudioRef {
  key: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface KalturaRef {
  entryId: string;
  partnerId: string;
  widgetId?: string;
  uiconfId?: string;
  sourceInput: string;
}

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

  source: InterviewSource;
  audioRef?: AudioRef;
  kalturaRef?: KalturaRef;
  video?: import('./interview').InterviewVideo;

  processing: {
    status: ProcessingStatus;
    queuedAt?: string;
    startedAt?: string;
    transcribedAt?: string;
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

  analysisStamp?: {
    promptVersion: string;
    promptHash: string;
    schemaVersion: string;
  };

  reprocessRequestedAt?: string;

  createdAt: string;
  updatedAt: string;
}

export type ProcessingQueueReason =
  | 'new_upload'
  | 'new_upload_audio'
  | 'new_upload_kaltura'
  | 'retry_admin'
  | 'retry_auto'
  | 'reprocess_version_drift';

export interface ProcessingQueueMessage {
  interviewId: string;
  queuedAt: string;
  priority?: 'high' | 'normal';
  metadata?: {
    triggeredBy: string;
    reason: ProcessingQueueReason;
  };
}

export interface CreateInterviewRequest {
  title: string;
  demographics: import('./interview').Demographics;
  metadata: import('./interview').InterviewMetadata;
}
