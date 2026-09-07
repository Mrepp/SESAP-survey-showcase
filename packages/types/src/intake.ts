/**
 * Types for self-service alumni intake: the submitter's session, the consent
 * they gave, their review of their own analysis, and the notification queue
 * that ties processing back to email.
 */

/** How a contributor chose to be credited. Never defaulted — always chosen. */
export type AttributionChoice = 'named' | 'anonymous';

/** Where an interview came from. Absent on legacy records, which read as admin. */
export type InterviewOrigin = 'admin' | 'self_service';

/**
 * The email-verified identity behind a self-service submission. This is the
 * only place a submitter's address is stored; it never reaches the public build.
 */
export interface Submitter {
  email: string;
  /** Display name as entered, used for attribution when consent says `named`. */
  name: string;
  major?: string;
  graduationYear?: string;
  verifiedAt: string;
}

/**
 * Archived proof of consent. Written to R2 alongside the interview and never
 * mutated — a correction is a new record, not an edit.
 */
export interface ConsentRecord {
  interviewId: string;
  /** Version label of the consent text the submitter actually saw. */
  consentVersion: string;
  /** SHA-256 of the rendered consent text, so the exact wording is provable. */
  consentHash: string;
  attribution: AttributionChoice;
  /** Name as consented for attribution; absent when publishing anonymously. */
  displayName?: string;
  agreedAt: string;
  /** Request metadata captured at the moment of agreement. */
  ip?: string;
  userAgent?: string;
}

/** Media a submitter recorded or uploaded, stored in R2 under `media/`. */
export interface SubmitterMedia {
  key: string;
  contentType: string;
  sizeBytes: number;
  /** `video` when the camera was on, `audio` for the audio-only option. */
  kind: 'video' | 'audio';
  uploadedAt: string;
}

/** State of the submitter's own review of their analysis. */
export interface SubmitterReview {
  /** SHA-256 of the review token; the token itself is only ever emailed. */
  tokenHash?: string;
  tokenExpiresAt?: string;
  /** Set once the submitter hands the interview to admin review. */
  submittedAt?: string;
  /**
   * How many times admin has sent this back. Capped so a submission cannot
   * ping-pong forever; past the cap, rejection is terminal.
   */
  revisionRound: number;
}

/** A step of the intake wizard the submitter has completed. */
export interface IntakeSession {
  email: string;
  verifiedAt: string;
  name?: string;
  major?: string;
  graduationYear?: string;
  demographics?: import('./interview').Demographics;
  consent?: {
    consentVersion: string;
    attribution: AttributionChoice;
    agreedAt: string;
  };
  /** Set once an interview record exists, so a resumed session finds its upload. */
  interviewId?: string;
  /**
   * The interview this session already submitted. One session, one interview:
   * a resumed wizard lands on the thank-you step instead of recording again,
   * and `upload/start` refuses to reuse or replace the record.
   */
  submittedInterviewId?: string;
  /** In-flight R2 multipart upload, so a dropped upload resumes rather than restarts. */
  upload?: {
    key: string;
    uploadId: string;
    contentType: string;
    parts: { partNumber: number; etag: string }[];
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Cross-worker event. Processing and admin produce; intake is the sole consumer
 * and the only worker that sends mail. No PII rides the queue — intake resolves
 * the submitter from the interview record.
 */
export interface NotificationMessage {
  kind: 'processed' | 'rejected' | 'approved';
  interviewId: string;
  queuedAt: string;
  /**
   * Why processing ran, for `processed`. A reprocess an admin asked for is an
   * admin matter; intake must not reopen the submitter's review for it.
   */
  reason?: import('./admin').ProcessingQueueReason;
}

/**
 * What the submitter's editor is given: only what they need to review their
 * own interview, no admin fields. Declared here so the intake worker and its UI
 * cannot drift apart.
 */
export interface SubmitterView {
  id: string;
  title: string;
  demographics: import('./interview').Demographics;
  metadata: import('./interview').InterviewMetadata;
  transcript: string;
  analysis: import('./analysis').Analysis | null;
  approvalStatus: import('./admin').ApprovalStatus;
  rejectionReason?: string;
  revisionRound: number;
}
