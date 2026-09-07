export type ProcessingStatus =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'processing'
  | 'completed'
  | 'failed';
/**
 * `pending_submitter_review` is the self-service gate: the analysis is ready
 * and waiting on the contributor, not on staff. `pending_review` keeps its
 * meaning — awaiting an admin.
 */
export type ApprovalStatus =
  | 'pending_review'
  | 'pending_submitter_review'
  | 'approved'
  | 'rejected';

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

export interface InterviewRecord {
  id: string;
  title: string;
  demographics: import('./interview').Demographics;
  metadata: import('./interview').InterviewMetadata;

  source: InterviewSource;
  audioRef?: AudioRef;
  kalturaRef?: KalturaRef;
  video?: import('./interview').InterviewVideo;

  /**
   * Self-service fields. All optional, so records written before intake
   * existed deserialize unchanged; an absent `origin` reads as `'admin'`
   * rather than being backfilled.
   */
  origin?: import('./intake').InterviewOrigin;
  submitter?: import('./intake').Submitter;
  consent?: import('./intake').ConsentRecord;
  media?: import('./intake').SubmitterMedia;
  submitterReview?: import('./intake').SubmitterReview;

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

/**
 * Why a message was put on the processing queue. Deliberately does not encode
 * the upload's medium — that is `InterviewRecord.source`, and duplicating it
 * here let the two drift.
 */
export type ProcessingQueueReason =
  | 'new_upload'
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

/**
 * Everything an editor can change about one interview, saved as a unit.
 *
 * Title, demographics, metadata and analysis used to be four separate PUTs —
 * four non-atomic writes to one logical record. They travel together now, and
 * the submitter-facing editor reuses the same shape.
 *
 * Every field is optional so a caller can send only what it edits; omitted
 * fields are left untouched.
 */
export interface InterviewDraft {
  title?: string;
  demographics?: import('./interview').Demographics;
  metadata?: import('./interview').InterviewMetadata;
  analysis?: import('./analysis').Analysis;
}
