import type { Analysis, InterviewEmbeddings, InterviewRecord } from '@sesap/types';
import { currentPromptStamp } from '@sesap/core';
import { makeFixtureAnalysis } from './analysis';
import { makeEmbeddings, makeSampleInterview } from './sample-interview';
import { FIXTURE_TRANSCRIPT, FIXTURE_TRANSCRIPT_LONG } from './transcripts';

/**
 * What `pnpm seed` writes into the local `.wrangler/state`. Declared as data
 * here so the seed script stays a dumb writer and the shapes are typechecked
 * against the real domain types.
 */

/** Generous enough that nothing 503s locally; small enough to exhaust on purpose. */
export const SEED_NEURON_BUDGET = 2_000_000;

/** The public search endpoint's separate, smaller pool. */
export const SEED_SHOWCASE_NEURON_BUDGET = 200_000;

/** The identity the admin worker's development auth bypass hands out. */
export const SEED_ADMIN_EMAIL = 'dev@localhost';

/**
 * A fixed review token for the seeded `pending_submitter_review` interview.
 *
 * Review tokens are normally random and mailed once — the only way to reach
 * the submitter review screen is to walk the whole wizard. Seeding a known one
 * makes that screen a URL you can paste. It is fixed rather than random so the
 * URL survives a re-seed, and it only ever exists in local state.
 */
export const SEED_REVIEW_TOKEN = 'devdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevdevd';

export const SEED_SUBMITTER_EMAIL = 'beaver@oregonstate.edu';

const SEEDED_AT = '2026-01-01T00:00:00.000Z';

export interface SeedInterviewFixture {
  id: string;
  /** One line printed by the seed script, so the output explains itself. */
  label: string;
  record: InterviewRecord;
  transcript?: string;
  analysis?: Analysis;
  embeddings?: InterviewEmbeddings;
  /** Plaintext review token; the seed script stores only its hash. */
  reviewToken?: string;
}

function baseRecord(id: string, title: string): InterviewRecord {
  return {
    id,
    title,
    demographics: {
      college: 'Oregon State University',
      graduationYear: '2024',
      major: 'Computer Science',
    },
    metadata: { interviewDate: '2026-01-01', interviewer: 'Seed Fixture' },
    source: 'transcript',
    processing: { status: 'completed', completedAt: SEEDED_AT },
    approval: { status: 'pending_review' },
    artifacts: { transcript: false, analysis: false, embeddings: false },
    createdAt: SEEDED_AT,
    updatedAt: SEEDED_AT,
  };
}

/**
 * One interview per state the lifecycle can be in, so every screen has
 * something to render on a fresh clone without walking the wizard first.
 */
export function buildSeedInterviews(): SeedInterviewFixture[] {
  const fixtures: SeedInterviewFixture[] = [];

  // 1. Admin-origin, approved, fully processed — what the showcase renders.
  //    Indexing assembles the public document from the record and these three
  //    artifacts at build time; there is no separate snapshot to seed.
  {
    const id = 'int_seedapproved';
    const analysis = makeFixtureAnalysis(id);
    const title = 'Finding a way through the first year';
    fixtures.push({
      id,
      label: 'approved · admin origin · visible in the showcase',
      transcript: FIXTURE_TRANSCRIPT_LONG,
      analysis,
      embeddings: makeEmbeddings({ ...makeSampleInterview({ id, title }), analysis }),
      record: {
        ...baseRecord(id, title),
        origin: 'admin',
        approval: { status: 'approved', reviewedAt: SEEDED_AT, reviewedBy: SEED_ADMIN_EMAIL },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        analysisStamp: currentPromptStamp,
      },
    });
  }

  // 2. Self-service, waiting on its submitter — reachable via SEED_REVIEW_TOKEN.
  {
    const id = 'int_seedsubmittr';
    const analysis = makeFixtureAnalysis(id);
    fixtures.push({
      id,
      label: 'pending_submitter_review · self-service · open the printed review link',
      transcript: FIXTURE_TRANSCRIPT_LONG,
      analysis,
      reviewToken: SEED_REVIEW_TOKEN,
      record: {
        ...baseRecord(id, 'Alumni interview awaiting its author'),
        source: 'audio',
        origin: 'self_service',
        submitter: {
          email: SEED_SUBMITTER_EMAIL,
          name: 'Casey Beaver',
          major: 'Computer Science',
          graduationYear: '2024',
          verifiedAt: SEEDED_AT,
        },
        submitterReview: { revisionRound: 0 },
        approval: { status: 'pending_submitter_review' },
        artifacts: { transcript: true, analysis: true, embeddings: false },
        analysisStamp: currentPromptStamp,
      },
    });
  }

  // 3. Self-service, submitted — sitting in the admin approval queue.
  {
    const id = 'int_seedpending0';
    const analysis = makeFixtureAnalysis(id);
    fixtures.push({
      id,
      label: 'pending_review · self-service · approve or reject it in admin',
      transcript: FIXTURE_TRANSCRIPT,
      analysis,
      record: {
        ...baseRecord(id, 'Building tools, and a wall'),
        source: 'audio',
        origin: 'self_service',
        submitter: {
          email: SEED_SUBMITTER_EMAIL,
          name: 'Casey Beaver',
          verifiedAt: SEEDED_AT,
        },
        submitterReview: { revisionRound: 0, submittedAt: SEEDED_AT },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: true, embeddings: false },
        analysisStamp: currentPromptStamp,
      },
    });
  }

  // 4. Failed processing. Its transcript is already in R2, so retrying it from
  //    admin actually walks the whole pipeline — queue delivery, the AI
  //    provider, embeddings, the notification back to intake — rather than
  //    failing again on a missing artifact.
  {
    const id = 'int_seedfailed00';
    fixtures.push({
      id,
      label: 'failed · retry it from admin to run the whole pipeline',
      transcript: FIXTURE_TRANSCRIPT,
      record: {
        ...baseRecord(id, 'Interview that failed to process'),
        source: 'transcript',
        origin: 'admin',
        processing: {
          status: 'failed',
          queuedAt: SEEDED_AT,
          failedAt: SEEDED_AT,
          error: 'Seeded failure: Invalid JSON from LLM',
          retryCount: 1,
        },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: false, embeddings: false },
      },
    });
  }

  return fixtures;
}
