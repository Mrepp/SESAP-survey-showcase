import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createInterview, listInterviews, getInterview, rejectInterview } from '../src/services/interview-service';
import type { Env } from '../src/bindings';
import type { CreateInterviewRequest, ProcessingQueueMessage } from '@sesap/types';

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
  };
}

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
});
