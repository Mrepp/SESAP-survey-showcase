import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  approveInterview,
  createInterview,
  createInterviewFromKaltura,
  listInterviews,
  getInterview,
  rejectInterview,
} from '../src/services/interview-service';
import type { Env } from '../src/bindings';
import { interviews } from '../src/routes/interviews';
import type { Analysis, CreateInterviewRequest, InterviewRecord, ProcessingQueueMessage } from '@sesap/types';
import { KV_KEYS, R2_PATHS } from '@sesap/types';

// Mock R2 bucket
function createMockR2Bucket(): R2Bucket {
  const store = new Map<string, string>();
  return {
    put: vi.fn(async (key: string, value: string | ReadableStream | ArrayBuffer | Blob | null) => {
      store.set(key, typeof value === 'string' ? value : '');
      return {} as R2Object;
    }),
    get: vi.fn(async (key: string) => {
      const val = store.get(key);
      if (!val) return null;
      return {
        text: async () => val,
        json: async () => JSON.parse(val),
        body: null,
        bodyUsed: false,
        arrayBuffer: async () => new ArrayBuffer(0),
        blob: async () => new Blob(),
      } as unknown as R2ObjectBody;
    }),
    head: vi.fn(async (key: string) => {
      return store.has(key) ? ({} as R2Object) : null;
    }),
    delete: vi.fn(),
    list: vi.fn(),
    createMultipartUpload: vi.fn(),
    resumeMultipartUpload: vi.fn(),
  } as unknown as R2Bucket;
}

// Mock KV namespace
function createMockKVNamespace(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    put: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    delete: vi.fn(),
    list: vi.fn(),
    getWithMetadata: vi.fn(),
  } as unknown as KVNamespace;
}

function createMockEnv(): Env {
  return {
    ASSETS: { fetch: vi.fn() } as unknown as Fetcher,
    SESAP_BUCKET: createMockR2Bucket(),
    SESAP_KV: createMockKVNamespace(),
    PROCESSING_WORKER: { fetch: vi.fn() } as unknown as Fetcher,
    PROCESSING_QUEUE: { send: vi.fn() } as unknown as Queue<ProcessingQueueMessage>,
    INDEXING_WORKER: { fetch: vi.fn() } as unknown as Fetcher,
    ENVIRONMENT: 'development',
    SHOWCASE_URL: 'http://localhost:8790',
    KALTURA_PARTNER_ID: '391241',
    KALTURA_UICONF_ID: '55338833',
  };
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
    env = createMockEnv();
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

    it('should add interview ID to the list in KV', async () => {
      const request: CreateInterviewRequest = {
        title: 'Test',
        demographics: { college: 'Arts', graduationYear: '2023', major: 'History' },
        metadata: { interviewDate: '2024-01-01', interviewer: 'Test' },
      };

      const record = await createInterview(env, request, 'transcript text');

      // The list should contain the new ID
      const listCall = (env.SESAP_KV.put as ReturnType<typeof vi.fn>).mock.calls.find(
        (call: unknown[]) => call[0] === 'interviews:list',
      );
      expect(listCall).toBeDefined();
      const list = JSON.parse(listCall![1] as string);
      expect(list).toContain(record.id);
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
    it('preserves display video metadata in the approved interview repository object', async () => {
      const request: CreateInterviewRequest = {
        title: 'Video Approval',
        demographics: { college: 'Engineering', graduationYear: '2024', major: 'CS' },
        metadata: { interviewDate: '2024-01-15' },
      };

      const created = await createInterview(
        env,
        request,
        'Q: Tell me about your experience? A: This transcript is long enough to approve.',
        {
          provider: 'youtube',
          embedUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
          sourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        },
      );
      await env.SESAP_BUCKET.put(R2_PATHS.analysis(created.id), JSON.stringify(sampleAnalysis));

      await approveInterview(env, created.id);

      const stored = await env.SESAP_BUCKET.get(R2_PATHS.interview(created.id));
      const interview = await stored!.json<{ video?: { provider: string; embedUrl: string } }>();
      expect(interview.video?.provider).toBe('youtube');
      expect(interview.video?.embedUrl).toBe('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ');
    });
  });

  describe('title route', () => {
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
        `/api/interviews/${record.id}/title`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Updated Title' }),
        },
        env,
      );

      expect(response.status).toBe(200);
      const body = await response.json<{ data: InterviewRecord }>();
      expect(body.data.title).toBe('Updated Title');

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
        `/api/interviews/${record.id}/title`,
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

    it('updates title on an approved interview, patches R2 object, and marks build dirty', async () => {
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

      // Seed a minimal R2 interview repository object
      await env.SESAP_BUCKET.put(
        R2_PATHS.interview(record.id),
        JSON.stringify({ id: record.id, title: 'Approved Original', updatedAt: now }),
      );
      vi.clearAllMocks();

      const response = await interviews.request(
        `/api/interviews/${record.id}/title`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'Approved Updated' }),
        },
        env,
      );

      expect(response.status).toBe(200);

      // KV record should have new title
      const persistedRaw = await env.SESAP_KV.get(KV_KEYS.interview(record.id));
      const persisted = JSON.parse(persistedRaw!) as InterviewRecord;
      expect(persisted.title).toBe('Approved Updated');

      // R2 interview repository object should have new title and a different updatedAt
      const stored = await env.SESAP_BUCKET.get(R2_PATHS.interview(record.id));
      const storedInterview = await stored!.json<{ title: string; updatedAt: string }>();
      expect(storedInterview.title).toBe('Approved Updated');
      expect(storedInterview.updatedAt).not.toBe(now);

      // Build should be marked dirty
      const dirtyRaw = await env.SESAP_KV.get(KV_KEYS.buildDirty);
      expect(JSON.parse(dirtyRaw!)).toMatchObject({
        isDirty: true,
        lastChangeType: 'edit',
      });
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
  });
});
