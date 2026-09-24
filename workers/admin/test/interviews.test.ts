import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createMockEnv,
  createMockFetcher,
  createMockQueue,
} from '@sesap/test-utils';
import {
  approveInterview,
  approveForAnalysis,
  createInterview,
  createInterviewFromKaltura,
  deleteInterview,
  listInterviews,
  getInterview,
  rejectInterview,
  rejectBeforeAnalysis,
  MAX_REVISION_ROUNDS,
} from '../src/services/interview-service';
import type { Env } from '../src/bindings';
import { interviews } from '../src/routes/interviews';
import retry from '../src/routes/retry';
import type {
  Analysis,
  CreateInterviewRequest,
  InterviewRecord,
  NotificationMessage,
  ProcessingQueueMessage,
} from '@sesap/types';
import { KV_KEYS, R2_PATHS } from '@sesap/types';

function makeEnv(): Env {
  return createMockEnv<Env>({
    ASSETS: createMockFetcher(),
    PROCESSING_WORKER: createMockFetcher(),
    PROCESSING_QUEUE: createMockQueue<ProcessingQueueMessage>(),
    NOTIFICATION_QUEUE: createMockQueue<NotificationMessage>(),
    INDEXING_WORKER: createMockFetcher(),
    ENVIRONMENT: 'development',
    SHOWCASE_URL: 'http://localhost:8890',
    KALTURA_PARTNER_ID: '391241',
    KALTURA_UICONF_ID: '55338833',
  });
}

const sampleAnalysis: Analysis = {
  interviewId: 'test',
  modelConfig: { model: 'test', temperature: 0, maxTokens: 1000 },
  summaries: [],
  timeline: [],
  themes: [],
  quotes: [],
  areasForImprovement: [],
  identities: [],
  generatedAt: '2026-01-01T00:00:00.000Z',
};

describe('interview-service', () => {
  let env: Env;

  beforeEach(() => {
    env = makeEnv();
  });

  describe('createInterview', () => {
    it('should create an interview and store transcript in R2', async () => {
      const request: CreateInterviewRequest = {
        title: 'Test Interview',
        demographics: {
          college: 'Engineering',
          graduationYear: '2024',
          major: 'Computer Science',
        },
        metadata: {
          interviewDate: '2024-01-15',
          interviewer: 'Jane Doe',
        },
      };

      const record = await createInterview(env, request, 'This is a test transcript.');

      expect(record.id).toMatch(/^int_/);
      expect(record.title).toBe('Test Interview');
      expect(record.processing.status).toBe('queued');
      expect(record.approval.status).toBe('pending_review');
      expect(record.demographics.college).toBe('Engineering');

      // Verify R2 was called to store transcript
      expect(env.SESAP_BUCKET.put).toHaveBeenCalled();

      // Verify KV was called to store record
      expect(env.SESAP_KV.put).toHaveBeenCalled();
    });

    it('lists concurrently-created interviews without losing any', async () => {
      // Regression: the interview index used to be a single JSON array in KV,
      // mutated read-modify-write on every create. Two creates racing meant one
      // of them vanished from the dashboard. The index is now the key space.
      const request = (title: string): CreateInterviewRequest => ({
        title,
        demographics: { college: 'Arts', graduationYear: '2023', major: 'History' },
        metadata: { interviewDate: '2024-01-01', interviewer: 'Test' },
      });

      const created = await Promise.all([
        createInterview(env, request('One'), 'transcript one'),
        createInterview(env, request('Two'), 'transcript two'),
        createInterview(env, request('Three'), 'transcript three'),
        createInterview(env, request('Four'), 'transcript four'),
      ]);

      const listed = await listInterviews(env);
      expect(listed.map((record) => record.id).sort()).toEqual(
        created.map((record) => record.id).sort(),
      );
    });
  });

  describe('createInterviewFromKaltura', () => {
    it('stores a normalized public video embed for Kaltura uploads', async () => {
      const request: CreateInterviewRequest = {
        title: 'Kaltura Test',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15' },
      };

      const record = await createInterviewFromKaltura(
        env,
        request,
        '<iframe src="https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?entry_id=1_oixah593"></iframe>',
      );

      expect(record.kalturaRef?.entryId).toBe('1_oixah593');
      expect(record.video?.provider).toBe('kaltura');
      expect(record.video?.embedUrl).toContain('/p/391241/embedPlaykitJs/uiconf_id/55338833');
      expect(record.video?.embedUrl).toContain('entry_id=1_oixah593');
    });
  });

  describe('self-service Kaltura moderation', () => {
    function kalturaSubmission(): InterviewRecord {
      const now = '2026-01-01T00:00:00.000Z';
      return {
        id: 'int_kalturamod1',
        title: 'Self-service Kaltura interview',
        demographics: {},
        metadata: { interviewDate: '2026-01-01' },
        source: 'kaltura',
        origin: 'self_service',
        kalturaRef: {
          entryId: '1_oixah593',
          partnerId: '391241',
          sourceInput: 'https://media.oregonstate.edu/media/t/1_oixah593/example',
        },
        video: {
          provider: 'kaltura',
          embedUrl: 'https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/55338833?entry_id=1_oixah593',
        },
        processing: { status: 'pending' },
        approval: { status: 'pending_media_review' },
        artifacts: { transcript: false, analysis: false, embeddings: false },
        createdAt: now,
        updatedAt: now,
      };
    }

    it('approves a normalized Kaltura reference without requiring R2 media', async () => {
      const record = kalturaSubmission();
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const approved = await approveForAnalysis(env, record.id, 'admin@example.edu');

      expect(approved.processing.status).toBe('queued');
      expect(approved.approval.preAnalysisReviewedBy).toBe('admin@example.edu');
      expect(env.PROCESSING_QUEUE.send).toHaveBeenCalledWith(
        expect.objectContaining({ interviewId: record.id }),
      );
    });

    it('removes an external Kaltura reference when rejected before analysis', async () => {
      const record = kalturaSubmission();
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const rejected = await rejectBeforeAnalysis(
        env,
        record.id,
        'Not an interview.',
        'admin@example.edu',
      );

      expect(rejected.approval.status).toBe('rejected');
      expect(rejected.kalturaRef).toBeUndefined();
      expect(rejected.video).toBeUndefined();
    });
  });

  describe('listInterviews', () => {
    it('should return empty array when no interviews exist', async () => {
      const records = await listInterviews(env);
      expect(records).toEqual([]);
    });

    it('should return interviews after creation', async () => {
      const request: CreateInterviewRequest = {
        title: 'Listed Interview',
        demographics: { college: 'Science', graduationYear: '2025', major: 'Biology' },
        metadata: { interviewDate: '2024-06-01', interviewer: 'Interviewer' },
      };

      await createInterview(env, request, 'transcript');
      const records = await listInterviews(env);

      expect(records.length).toBe(1);
      expect(records[0].title).toBe('Listed Interview');
    });
  });

  describe('getInterview', () => {
    it('should throw NotFoundError for non-existent interview', async () => {
      await expect(getInterview(env, 'nonexistent')).rejects.toThrow('not found');
    });

    it('should return interview after creation', async () => {
      const request: CreateInterviewRequest = {
        title: 'Get Test',
        demographics: { college: 'Business', graduationYear: '2022', major: 'Finance' },
        metadata: { interviewDate: '2024-03-01', interviewer: 'Someone' },
      };

      const created = await createInterview(env, request, 'text');
      const fetched = await getInterview(env, created.id);

      expect(fetched.id).toBe(created.id);
      expect(fetched.title).toBe('Get Test');
    });
  });

  describe('rejectInterview', () => {
    it('should update status to rejected with reason', async () => {
      const request: CreateInterviewRequest = {
        title: 'Reject Test',
        demographics: { college: 'Law', graduationYear: '2024', major: 'Law' },
        metadata: { interviewDate: '2024-02-01', interviewer: 'Tester' },
      };

      const created = await createInterview(env, request, 'transcript');
      const rejected = await rejectInterview(env, created.id, 'Poor quality');

      expect(rejected.approval.status).toBe('rejected');
      expect(rejected.approval.rejectionReason).toBe('Poor quality');
    });
  });

  describe('approveInterview', () => {
    async function completedRecord(overrides: Partial<InterviewRecord> = {}): Promise<InterviewRecord> {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_approve0001',
        title: 'Approvable',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
        ...overrides,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));
      await env.SESAP_BUCKET.put(R2_PATHS.transcript(record.id), 'Q: Tell me? A: Enough words here.');
      await env.SESAP_BUCKET.put(R2_PATHS.analysis(record.id), JSON.stringify(sampleAnalysis));
      return record;
    }

    it('approves a completed interview awaiting review and marks the build dirty', async () => {
      const record = await completedRecord();

      const approved = await approveInterview(env, record.id);

      expect(approved.approval.status).toBe('approved');
      // No approve-time snapshot: indexing assembles the public document from
      // the record and its artifacts at build time.
      expect(await env.SESAP_BUCKET.head(R2_PATHS.interview(record.id))).toBeNull();
      const dirty = JSON.parse((await env.SESAP_KV.get(KV_KEYS.buildDirty))!);
      expect(dirty).toMatchObject({ isDirty: true, lastChangeType: 'approve' });
    });

    it('refuses to approve an interview still awaiting its submitter', async () => {
      const record = await completedRecord({
        origin: 'self_service',
        approval: { status: 'pending_submitter_review' },
        submitterReview: { revisionRound: 0, tokenHash: 'abc' },
      });

      await expect(approveInterview(env, record.id)).rejects.toThrow(/cannot be approved/);
      expect((await getInterview(env, record.id)).approval.status).toBe('pending_submitter_review');
    });

    it('refuses to approve before processing completes', async () => {
      const record = await completedRecord({ processing: { status: 'processing' } });
      await expect(approveInterview(env, record.id)).rejects.toThrow(/until processing completes/);
    });

    it('burns any outstanding review link when approving a submitted self-service interview', async () => {
      const record = await completedRecord({
        origin: 'self_service',
        approval: { status: 'pending_review' },
        submitterReview: { revisionRound: 0, tokenHash: 'stale', tokenExpiresAt: '2099-01-01T00:00:00.000Z' },
      });

      const approved = await approveInterview(env, record.id);

      expect(approved.submitterReview?.tokenHash).toBeUndefined();
      expect(approved.submitterReview?.tokenExpiresAt).toBeUndefined();
      const queue = env.NOTIFICATION_QUEUE as unknown as { sent: { kind: string }[] };
      expect(queue.sent).toEqual([expect.objectContaining({ kind: 'approved' })]);
    });

    it('refuses to approve when the analysis artifact is missing', async () => {
      const record = await completedRecord({ id: 'int_noanalysis01' });
      await env.SESAP_BUCKET.delete(R2_PATHS.analysis(record.id));
      await expect(approveInterview(env, record.id)).rejects.toThrow(/Analysis not found/);
    });
  });

  describe('rejectInterview', () => {
    it('marks the build dirty when rejecting a published interview', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_unpublish01',
        title: 'Published',
        demographics: {},
        metadata: { interviewDate: '2024-01-15' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'approved', reviewedAt: now },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const rejected = await rejectInterview(env, record.id, 'Withdrawn at the participant\'s request');

      expect(rejected.approval.status).toBe('rejected');
      const dirty = JSON.parse((await env.SESAP_KV.get(KV_KEYS.buildDirty))!);
      expect(dirty).toMatchObject({ isDirty: true, lastChangeType: 'reject' });
    });
  });

  describe('deleteInterview', () => {
    it('removes self-service media and archives the consent record', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const id = 'int_delete00001';
      const record: InterviewRecord = {
        id,
        title: 'To delete',
        demographics: {},
        metadata: { interviewDate: '2024-01-15' },
        source: 'audio',
        origin: 'self_service',
        submitter: { email: 'beaver@oregonstate.edu', name: 'Casey', verifiedAt: now },
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'approved', reviewedAt: now },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
      await env.SESAP_BUCKET.put(R2_PATHS.media(id, 'webm'), 'video-bytes');
      await env.SESAP_BUCKET.put(R2_PATHS.audioTemp(id, 'mp3'), 'audio-bytes');
      await env.SESAP_BUCKET.put(R2_PATHS.transcript(id), 'text');
      await env.SESAP_BUCKET.put(R2_PATHS.consent(id), JSON.stringify({ interviewId: id, attribution: 'named' }));

      await deleteInterview(env, id, 'reviewer@example.edu');

      // This is the consent-withdrawal path. It used to call a function that
      // did not exist, so it threw before the `await` and deleted nothing: the
      // contributor's video stayed in R2, the KV record was orphaned, and an
      // approved-then-"deleted" interview stayed in the published build.
      expect(await env.SESAP_BUCKET.head(R2_PATHS.media(id, 'webm'))).toBeNull();
      expect(await env.SESAP_BUCKET.head(R2_PATHS.audioTemp(id, 'mp3'))).toBeNull();
      expect(await env.SESAP_BUCKET.head(R2_PATHS.transcript(id))).toBeNull();
      expect(await env.SESAP_BUCKET.head(R2_PATHS.consent(id))).toBeNull();
      const withdrawn = await env.SESAP_BUCKET.get(R2_PATHS.consentWithdrawn(id));
      expect(await withdrawn!.json()).toMatchObject({
        attribution: 'named',
        withdrawn: { deletedBy: 'reviewer@example.edu' },
      });
      expect(await env.SESAP_KV.get(KV_KEYS.interview(id))).toBeNull();
      const dirty = JSON.parse((await env.SESAP_KV.get(KV_KEYS.buildDirty))!);
      expect(dirty).toMatchObject({ isDirty: true, lastChangeType: 'delete' });
    });

    it('still removes the record and marks the build when one artifact fails', async () => {
      // Erasure must not be all-or-nothing across seven independent deletes: a
      // single R2 hiccup leaving the KV record behind, and an unpublished
      // interview still in the build, is the worse outcome.
      const now = '2026-01-01T00:00:00.000Z';
      const id = 'int_delete00002';
      const record: InterviewRecord = {
        id,
        title: 'Partial failure',
        demographics: {},
        metadata: { interviewDate: '2024-01-15' },
        source: 'audio',
        origin: 'self_service',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'approved', reviewedAt: now },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));
      await env.SESAP_BUCKET.put(R2_PATHS.transcript(id), 'text');

      const realDelete = env.SESAP_BUCKET.delete.bind(env.SESAP_BUCKET);
      vi.spyOn(env.SESAP_BUCKET, 'delete').mockImplementation(async (key: string | string[]) => {
        if (key === R2_PATHS.transcript(id)) throw new Error('R2 unavailable');
        return realDelete(key as string);
      });

      await expect(deleteInterview(env, id, 'reviewer@example.edu')).resolves.toBeUndefined();

      expect(await env.SESAP_KV.get(KV_KEYS.interview(id))).toBeNull();
      const dirty = JSON.parse((await env.SESAP_KV.get(KV_KEYS.buildDirty))!);
      expect(dirty).toMatchObject({ isDirty: true, lastChangeType: 'delete' });
    });
  });

  describe('draft route', () => {
    it('updates title on a pending interview and persists to KV', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_title001',
        title: 'Original Title',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15', interviewer: 'Tester' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: true, embeddings: false },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await interviews.request(
        `/api/interviews/${record.id}/draft`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' }),
        },
        env,
      );

      expect(response.status).toBe(200);
      const body = await response.json<{ data: { record: InterviewRecord } }>();
      expect(body.data.record.title).toBe('Updated Title');

      const persistedRaw = await env.SESAP_KV.get(KV_KEYS.interview(record.id));
      const persisted = JSON.parse(persistedRaw!) as InterviewRecord;
      expect(persisted.title).toBe('Updated Title');

      // Pending interview must NOT mark build dirty
      const dirtyRaw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
      expect(dirtyRaw).toBeNull();
    });

    it('rejects blank titles', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_title002',
        title: 'Some Title',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: false, embeddings: false },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await interviews.request(
        `/api/interviews/${record.id}/draft`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: '   ' }),
        },
        env,
      );

      // ValidationError is thrown — app error handler maps it to 400 in production,
      // but testing through the sub-router directly yields 500.
      expect(response.status).not.toBe(200);
    });

    it('marks the build dirty for any edit to an approved interview', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_title003',
        title: 'Approved Original',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15', interviewer: 'Tester' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'approved', reviewedAt: now, reviewedBy: 'reviewer@example.com' },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));
      vi.clearAllMocks();

      // Demographics, not just the title: the public document is assembled at
      // build time, so every slice of an approved edit must trigger a rebuild.
      const response = await interviews.request(
        `/api/interviews/${record.id}/draft`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ demographics: { college: 'Engineering', graduationYear: '2025', major: 'CS' } }),
        },
        env,
      );

      expect(response.status).toBe(200);

      const persisted = JSON.parse((await env.SESAP_KV.get(KV_KEYS.interview(record.id)))!) as InterviewRecord;
      expect(persisted.demographics.graduationYear).toBe('2025');

      const dirtyRaw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
      expect(JSON.parse(dirtyRaw!)).toMatchObject({
        isDirty: true,
        lastChangeType: 'edit',
      });
    });

    it('saves an edited analysis and mints ids for editor-created items', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_analysis01',
        title: 'Analysis edit',
        demographics: {},
        metadata: { interviewDate: '2024-01-15' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'pending_review' },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await interviews.request(
        `/api/interviews/${record.id}/draft`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis: {
              ...sampleAnalysis,
              interviewId: record.id,
              summaries: [{ id: 'temp_1', summaryText: 'Edited', category: 'academic', confidence: 1 }],
            },
          }),
        },
        env,
      );

      expect(response.status).toBe(200);
      const stored = await env.SESAP_BUCKET.get(R2_PATHS.analysis(record.id));
      const analysis = await stored!.json<Analysis>();
      expect(analysis.summaries[0].id).toBe(`${record.id}_sum_0`);
      expect(analysis.promptVersion).toBeDefined();
    });
  });

  describe('reprocess route', () => {
    it('moves an approved interview back to pending review before queueing reprocessing', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_reprocess001',
        title: 'Needs Reprocessing',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15', interviewer: 'Tester' },
        source: 'transcript',
        processing: { status: 'completed', completedAt: now },
        approval: {
          status: 'approved',
          reviewedAt: now,
          reviewedBy: 'reviewer@example.com',
        },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));
      vi.clearAllMocks();

      const response = await interviews.request(
        `/api/interviews/${record.id}/reprocess`,
        { method: 'POST' },
        env,
      );

      expect(response.status).toBe(200);
      const body = await response.json<{ data: InterviewRecord }>();
      expect(body.data.processing.status).toBe('queued');
      expect(body.data.approval.status).toBe('pending_review');
      expect(body.data.approval.reviewedAt).toBeUndefined();
      expect(body.data.approval.reviewedBy).toBeUndefined();
      expect(body.data.artifacts.analysis).toBe(false);
      expect(body.data.artifacts.embeddings).toBe(false);

      const persistedRaw = await env.SESAP_KV.get(KV_KEYS.interview(record.id));
      const persisted = JSON.parse(persistedRaw!) as InterviewRecord;
      expect(persisted.approval.status).toBe('pending_review');
      expect(persisted.approval.reviewedAt).toBeUndefined();

      expect(env.PROCESSING_QUEUE.send).toHaveBeenCalledWith(
        expect.objectContaining({ interviewId: record.id }),
      );

      const dirtyRaw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
      expect(JSON.parse(dirtyRaw!)).toMatchObject({
        isDirty: true,
        pendingChanges: 1,
        lastChangeType: 'reprocess',
      });
    });

    it('burns the submitter review link: a reprocess is an admin matter', async () => {
      const now = '2026-01-01T00:00:00.000Z';
      const record: InterviewRecord = {
        id: 'int_reprocess002',
        title: 'Self-service reprocess',
        demographics: {},
        metadata: { interviewDate: '2024-01-15' },
        source: 'audio',
        origin: 'self_service',
        submitterReview: { revisionRound: 0, tokenHash: 'live', tokenExpiresAt: '2099-01-01T00:00:00.000Z' },
        processing: { status: 'completed', completedAt: now },
        approval: { status: 'pending_submitter_review' },
        artifacts: { transcript: true, analysis: true, embeddings: true },
        createdAt: now,
        updatedAt: now,
      };
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await interviews.request(`/api/interviews/${record.id}/reprocess`, { method: 'POST' }, env);
      expect(response.status).toBe(200);

      const persisted = JSON.parse((await env.SESAP_KV.get(KV_KEYS.interview(record.id)))!) as InterviewRecord;
      expect(persisted.approval.status).toBe('pending_review');
      expect(persisted.submitterReview?.tokenHash).toBeUndefined();
    });
  });

  describe('retry route', () => {
    const inFlight = (startedAt: string): InterviewRecord => ({
      id: 'int_retry000001',
      title: 'In flight',
      demographics: {},
      metadata: { interviewDate: '2024-01-15' },
      source: 'transcript',
      processing: { status: 'processing', startedAt },
      approval: { status: 'pending_review' },
      artifacts: { transcript: true, analysis: false, embeddings: false },
      createdAt: startedAt,
      updatedAt: startedAt,
    });

    it('refuses to re-queue a run that started a moment ago', async () => {
      const record = inFlight(new Date().toISOString());
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await retry.request(`/api/interviews/${record.id}/retry`, { method: 'POST' }, env);

      expect(response.status).not.toBe(200);
      expect(env.PROCESSING_QUEUE.send).not.toHaveBeenCalled();
      expect((await getInterview(env, record.id)).processing.status).toBe('processing');
    });

    it('re-queues a run that has been in flight past the stuck window', async () => {
      const record = inFlight(new Date(Date.now() - 11 * 60 * 1000).toISOString());
      await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

      const response = await retry.request(`/api/interviews/${record.id}/retry`, { method: 'POST' }, env);

      expect(response.status).toBe(200);
      expect(env.PROCESSING_QUEUE.send).toHaveBeenCalledWith(
        expect.objectContaining({ interviewId: record.id, metadata: expect.objectContaining({ reason: 'retry_admin' }) }),
      );
      expect((await getInterview(env, record.id)).processing.status).toBe('queued');
    });
  });
});

describe('self-service revision loop', () => {
  let env: Env;

  const selfServiceRecord = (revisionRound: number): InterviewRecord => ({
    id: 'int_selfserve01',
    title: 'Alumni interview',
    demographics: {},
    metadata: { interviewDate: '2026-01-01' },
    source: 'audio',
    origin: 'self_service',
    submitter: { email: 'beaver@oregonstate.edu', name: 'Casey', verifiedAt: '2026-01-01T00:00:00.000Z' },
    submitterReview: { revisionRound },
    processing: { status: 'completed' },
    approval: { status: 'pending_review' },
    artifacts: { transcript: true, analysis: true, embeddings: true },
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  });

  beforeEach(() => {
    env = makeEnv();
  });

  it('sends a self-service interview back to its submitter and counts the round', async () => {
    const record = selfServiceRecord(0);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const rejected = await rejectInterview(env, record.id, 'Please fix the timeline.');

    expect(rejected.approval.status).toBe('pending_submitter_review');
    expect(rejected.submitterReview?.revisionRound).toBe(1);
    // The previous token must not survive a re-open; intake mints a new one.
    expect(rejected.submitterReview?.tokenHash).toBeUndefined();

    const queue = env.NOTIFICATION_QUEUE as unknown as { sent: { kind: string }[] };
    expect(queue.sent).toEqual([expect.objectContaining({ kind: 'rejected' })]);
  });

  it('makes rejection terminal once the revision cap is reached', async () => {
    const record = selfServiceRecord(MAX_REVISION_ROUNDS);
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const rejected = await rejectInterview(env, record.id, 'Still not usable.');

    expect(rejected.approval.status).toBe('rejected');
    expect(rejected.submitterReview?.revisionRound).toBe(MAX_REVISION_ROUNDS);

    const queue = env.NOTIFICATION_QUEUE as unknown as { sent: unknown[] };
    expect(queue.sent).toHaveLength(0);
  });

  it('keeps admin-authored rejections terminal', async () => {
    const record = { ...selfServiceRecord(0), origin: 'admin' as const, submitter: undefined };
    await env.SESAP_KV.put(KV_KEYS.interview(record.id), JSON.stringify(record));

    const rejected = await rejectInterview(env, record.id, 'Out of scope.');
    expect(rejected.approval.status).toBe('rejected');
  });
});
