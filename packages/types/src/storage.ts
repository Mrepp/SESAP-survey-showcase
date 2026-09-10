/**
 * Which Workers AI daily budget a call draws from.
 *
 * - `pipeline` — processing and indexing. Exhausting it defers work, never
 *   loses it.
 * - `showcase` — the public semantic-search endpoint. Anyone on the internet
 *   can spend this one, so it is kept apart from the pipeline's.
 */
export const AI_BUDGET_POOLS = ['pipeline', 'showcase'] as const;
export type AiBudgetPool = (typeof AI_BUDGET_POOLS)[number];

export const R2_PATHS = {
  transcript: (id: string) => `transcripts/${id}.txt`,
  analysis: (id: string) => `analysis/${id}.json`,
  embeddings: (id: string) => `embeddings/${id}.json`,
  /**
   * Legacy approve-time snapshot. Indexing assembles the public interview from
   * the record plus `transcript`/`analysis`/`embeddings` now; this path exists
   * only so deletes can clean up objects written before that change.
   */
  interview: (id: string) => `interview_repository/${id}.json`,
  audioTemp: (id: string, ext: string) => `audio/temp/${id}.${ext}`,
  /** Self-service media as uploaded by the contributor. */
  media: (id: string, ext: string) => `media/${id}.${ext}`,
  mediaPrefix: (id: string) => `media/${id}.`,
  /** Immutable archived consent record. */
  consent: (id: string) => `consent/${id}.json`,
  /** Consent record of a deleted interview, kept as proof of agreement and withdrawal. */
  consentWithdrawn: (id: string) => `consent/withdrawn/${id}.json`,
  audioTempPrefix: (id: string) => `audio/temp/${id}.`,
  /**
   * An unversioned build object. Only `metadata.json` — the pointer to the
   * current build — lives here; everything else is written under its build id
   * so a client never mixes artifacts from two builds.
   */
  buildArtifact: (name: string) => `build/${name}`,
  buildVersionedArtifact: (buildId: string, name: string) => `build/${buildId}/${name}`,
  buildVersionPrefix: (buildId: string) => `build/${buildId}/`,
  buildPrefix: 'build/',
} as const;

export const KV_KEYS = {
  interview: (id: string) => `interview:${id}`,
  /** List prefix for {@link KV_KEYS.interview} — the interview index is the key space itself. */
  interviewPrefix: 'interview:',
  buildManifest: 'build:manifest',
  buildDirty: 'build:dirty',
  /** Admin allow-list, an `AllowedUser[]`. */
  adminAllowedUsers: 'auth:allowed-emails',
  /**
   * Daily neuron cap per budget pool. The pipeline pool keeps the historical
   * unsuffixed key so an existing deployment's budget carries over unchanged.
   */
  aiNeuronsDailyMax: (pool: AiBudgetPool = 'pipeline') =>
    pool === 'pipeline' ? 'ai:neurons:daily:max' : `ai:neurons:daily:max:${pool}`,
  aiNeuronsDailyUsage: (date: string, pool: AiBudgetPool = 'pipeline') =>
    pool === 'pipeline' ? `ai:neurons:daily:${date}` : `ai:neurons:daily:${pool}:${date}`,

  /** Intake wizard session, keyed by the opaque id carried in the signed cookie. */
  intakeSession: (sessionId: string) => `intake:session:${sessionId}`,
  /** Hashed self-review token, mapping to the interview it unlocks. */
  intakeReviewToken: (tokenHash: string) => `intake:review:${tokenHash}`,
  /**
   * How many interviews one verified address has submitted. Keyed by SHA-256 of
   * the normalized address, so the quota survives a fresh session — a session
   * counter caps nothing when new sessions are three code requests away — and a
   * KV listing does not yield a list of contributors' addresses.
   */
  intakeSubmissionCount: (emailHash: string) => `intake:submissions:${emailHash}`,
  /**
   * Newest session id for an address. Verifying again retires the previous
   * session rather than accumulating parallel ones.
   */
  intakeEmailSession: (emailHash: string) => `intake:email-session:${emailHash}`,
} as const;
