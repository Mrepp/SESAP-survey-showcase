import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { ApiResponse, InterviewRecord, Analysis, AuthenticatedUser, Demographics, InterviewMetadata } from '@sesap/types';
import { KV_KEYS } from '@sesap/types';
import { CreateInterviewRequestSchema, AnalysisSchema, DemographicsSchema, InterviewMetadataSchema } from '@sesap/shared';
import { ValidationError, generateItemId } from '@sesap/shared';
import * as interviewService from '../services/interview-service';
import * as storageService from '../services/storage-service';

type Variables = {
  user: AuthenticatedUser;
};

const interviews = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/interviews - multipart form upload
interviews.post('/api/interviews', async (c) => {
  const formData = await c.req.formData();

  const transcriptFile = formData.get('transcript');
  if (!transcriptFile || typeof transcriptFile === 'string') {
    throw new ValidationError('Missing transcript file');
  }

  const metadataRaw = formData.get('metadata');
  if (!metadataRaw || typeof metadataRaw !== 'string') {
    throw new ValidationError('Missing metadata JSON');
  }

  let parsedMetadata: unknown;
  try {
    parsedMetadata = JSON.parse(metadataRaw);
  } catch {
    throw new ValidationError('Invalid metadata JSON');
  }

  const result = CreateInterviewRequestSchema.safeParse(parsedMetadata);
  if (!result.success) {
    throw new ValidationError('Invalid request data', result.error.flatten());
  }

  const transcriptText = await (transcriptFile as File).text();
  if (!transcriptText.trim()) {
    throw new ValidationError('Transcript file is empty');
  }

  const record = await interviewService.createInterview(c.env, result.data, transcriptText);

  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response, 201);
});

// GET /api/interviews - list all
interviews.get('/api/interviews', async (c) => {
  const records = await interviewService.listInterviews(c.env);
  const response: ApiResponse<InterviewRecord[]> = {
    success: true,
    data: records,
  };
  return c.json(response);
});

// GET /api/interviews/:id - single interview detail
interviews.get('/api/interviews/:id', async (c) => {
  const id = c.req.param('id');
  const record = await interviewService.getInterview(c.env, id);
  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

// GET /api/interviews/:id/transcript - stream raw transcript
interviews.get('/api/interviews/:id/transcript', async (c) => {
  const id = c.req.param('id');
  const transcript = await storageService.getTranscript(c.env.SESAP_BUCKET, id);
  return c.text(transcript);
});

// GET /api/interviews/:id/analysis - get analysis JSON
interviews.get('/api/interviews/:id/analysis', async (c) => {
  const id = c.req.param('id');
  const analysis = await storageService.getAnalysis(c.env.SESAP_BUCKET, id);
  const response: ApiResponse<Analysis> = {
    success: true,
    data: analysis,
  };
  return c.json(response);
});

// PUT /api/interviews/:id/analysis - save corrected analysis
interviews.put('/api/interviews/:id/analysis', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const result = AnalysisSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Invalid analysis data', result.error.flatten());
  }

  // Reassign temporary IDs with proper IDs
  const analysis = result.data;
  const reassign = (items: { id: string }[], type: string) => {
    items.forEach((item, i) => {
      if (item.id.startsWith('temp_')) {
        item.id = generateItemId(id, type, i);
      }
    });
  };
  reassign(analysis.summaries, 'sum');
  reassign(analysis.timeline, 'tl');
  reassign(analysis.themes, 'thm');
  reassign(analysis.quotes, 'qt');
  reassign(analysis.areasForImprovement, 'afi');

  await storageService.putAnalysis(c.env.SESAP_BUCKET, id, analysis as Analysis);

  // Update KV record timestamp
  const record = await interviewService.getInterview(c.env, id);
  record.updatedAt = new Date().toISOString();
  await c.env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Mark indexes dirty if editing an approved interview
  if (record.approval.status === 'approved') {
    await interviewService.markBuildDirty(c.env, 'edit');
  }

  const response: ApiResponse<Analysis> = {
    success: true,
    data: analysis as Analysis,
  };
  return c.json(response);
});

// PUT /api/interviews/:id/demographics - save corrected demographics
interviews.put('/api/interviews/:id/demographics', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const result = DemographicsSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Invalid demographics data', result.error.flatten());
  }

  const record = await interviewService.getInterview(c.env, id);
  record.demographics = result.data as Demographics;
  record.updatedAt = new Date().toISOString();
  await c.env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Mark indexes dirty if editing an approved interview
  if (record.approval.status === 'approved') {
    await interviewService.markBuildDirty(c.env, 'edit');
  }

  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

// PUT /api/interviews/:id/metadata - save corrected interview metadata
interviews.put('/api/interviews/:id/metadata', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const result = InterviewMetadataSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError('Invalid metadata', result.error.flatten());
  }

  const record = await interviewService.getInterview(c.env, id);
  record.metadata = result.data as InterviewMetadata;
  record.updatedAt = new Date().toISOString();
  await c.env.SESAP_KV.put(KV_KEYS.interview(id), JSON.stringify(record));

  // Mark indexes dirty if editing an approved interview
  if (record.approval.status === 'approved') {
    await interviewService.markBuildDirty(c.env, 'edit');
  }

  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

// POST /api/interviews/:id/approve
interviews.post('/api/interviews/:id/approve', async (c) => {
  const id = c.req.param('id');
  const record = await interviewService.approveInterview(c.env, id);
  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

// POST /api/interviews/:id/reject
interviews.post('/api/interviews/:id/reject', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json<{ reason?: string }>();
  const reason = body.reason ?? 'No reason provided';
  const record = await interviewService.rejectInterview(c.env, id, reason);
  const response: ApiResponse<InterviewRecord> = {
    success: true,
    data: record,
  };
  return c.json(response);
});

// DELETE /api/interviews/:id - delete interview and all artifacts
interviews.delete('/api/interviews/:id', async (c) => {
  const id = c.req.param('id');
  await interviewService.deleteInterview(c.env, id);
  const response: ApiResponse<{ deleted: string }> = {
    success: true,
    data: { deleted: id },
  };
  return c.json(response);
});

// POST /api/build - trigger index rebuild (proxies to indexing worker)
interviews.post('/api/build', async (c) => {
  const buildResponse = await c.env.INDEXING_WORKER.fetch(
    new Request('http://indexing/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }),
  );

  if (!buildResponse.ok) {
    const body = await buildResponse.text();
    return c.json({ success: false, error: { code: 'BUILD_FAILED', message: body } }, 500);
  }

  // Clear dirty flag on successful build
  await interviewService.clearBuildDirty(c.env);

  const result = await buildResponse.json();
  return c.json({ success: true, data: result });
});

// GET /api/build/status - get current build state + dirty flag
interviews.get('/api/build/status', async (c) => {
  const status = await interviewService.getBuildStatus(c.env);
  const response: ApiResponse<typeof status & { showcaseUrl: string }> = {
    success: true,
    data: { ...status, showcaseUrl: c.env.SHOWCASE_URL },
  };
  return c.json(response);
});

export { interviews };
