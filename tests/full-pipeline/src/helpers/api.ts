export const ADMIN_BASE = process.env.ADMIN_WORKER_URL ?? 'http://127.0.0.1:8787';
export const ADMIN_UI_BASE = process.env.ADMIN_UI_URL ?? 'http://127.0.0.1:3001';
export const SHOWCASE_BASE = process.env.SHOWCASE_WORKER_URL ?? 'http://127.0.0.1:8790';
export const SHOWCASE_UI_BASE = process.env.SHOWCASE_UI_URL ?? 'http://127.0.0.1:3000';

export const POLL_INTERVAL_MS = Number(process.env.PIPELINE_POLL_INTERVAL_MS ?? 10_000);
export const PROCESSING_TIMEOUT_MS = Number(process.env.PROCESSING_TIMEOUT_MS ?? 900_000);
export const BUILD_TIMEOUT_MS = Number(process.env.BUILD_TIMEOUT_MS ?? 60_000);

const DEFAULT_KALTURA_SOURCE =
  '<iframe id="kaltura_player" src=\'https://cdnapisec.kaltura.com/p/391241/embedPlaykitJs/uiconf_id/44855082?iframeembed=true&amp;entry_id=1_xnh816mu&amp;config%5Bprovider%5D=%7B%22widgetId%22%3A%221_67qr8qwl%22%7D&amp;config%5Bplayback%5D=%7B%22startTime%22%3A0%7D\'  style="width: 400px;height: 225px;border: 0;" allowfullscreen webkitallowfullscreen mozAllowFullScreen allow="autoplay *; fullscreen *; encrypted-media *" sandbox="allow-downloads allow-forms allow-same-origin allow-scripts allow-top-navigation allow-pointer-lock allow-popups allow-modals allow-orientation-lock allow-popups-to-escape-sandbox allow-presentation allow-top-navigation-by-user-activation" title="SESAP Interview 9 with Sanjida Yeasmin"></iframe>';

export function requireKalturaSource(): string {
  const src = (process.env.KALTURA_SOURCE ?? DEFAULT_KALTURA_SOURCE).trim();
  if (!src) {
    throw new Error(
      'KALTURA_SOURCE is empty. Set it to a Kaltura iframe embed, media URL, or bare entry id (e.g. 1_oixah593). See tests/full-pipeline/README.md.',
    );
  }
  return src;
}

export type ProcessingStatus =
  | 'pending'
  | 'queued'
  | 'transcribing'
  | 'processing'
  | 'completed'
  | 'failed';

export type ApprovalStatus = 'pending_review' | 'approved' | 'rejected';

export interface InterviewRecord {
  id: string;
  title: string;
  metadata: { interviewDate: string; interviewer?: string; interviewURL?: string; notes?: string };
  processing: { status: ProcessingStatus; error?: string };
  approval: { status: ApprovalStatus };
}

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string };
}

async function unwrap<T>(res: Response, label: string): Promise<T> {
  const body = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || !body.success || body.data === undefined) {
    const msg = body.error?.message ?? `HTTP ${res.status}`;
    throw new Error(`${label} failed: ${msg}`);
  }
  return body.data;
}

export async function checkPort(url: string, label: string): Promise<void> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    throw new Error(
      `${label} not reachable at ${url}. Start the dev stack before running this test. (${(e as Error).message})`,
    );
  }
}

export async function createKalturaInterview(opts: {
  title: string;
  kalturaSource: string;
}): Promise<InterviewRecord> {
  const form = new FormData();
  form.set('source', 'kaltura');
  form.set('kalturaSource', opts.kalturaSource);
  form.set(
    'metadata',
    JSON.stringify({
      title: opts.title,
      demographics: {
        college: 'College of Engineering',
        graduationYear: '2025',
        major: 'Mechanical Engineering',
      },
      metadata: { interviewDate: new Date().toISOString().slice(0, 10) },
    }),
  );

  const res = await fetch(`${ADMIN_BASE}/api/interviews`, { method: 'POST', body: form });
  return unwrap<InterviewRecord>(res, 'createKalturaInterview');
}

export async function getInterview(id: string): Promise<InterviewRecord> {
  const res = await fetch(`${ADMIN_BASE}/api/interviews/${id}`);
  return unwrap<InterviewRecord>(res, `getInterview(${id})`);
}

export async function listInterviews(): Promise<InterviewRecord[]> {
  const res = await fetch(`${ADMIN_BASE}/api/interviews`);
  return unwrap<InterviewRecord[]>(res, 'listInterviews');
}

export async function pollProcessingStatus(
  id: string,
  onTransition: (s: ProcessingStatus) => void,
): Promise<InterviewRecord> {
  const start = Date.now();
  let lastStatus: ProcessingStatus | null = null;
  while (Date.now() - start < PROCESSING_TIMEOUT_MS) {
    const rec = await getInterview(id);
    if (rec.processing.status !== lastStatus) {
      lastStatus = rec.processing.status;
      onTransition(lastStatus);
    }
    if (rec.processing.status === 'completed') return rec;
    if (rec.processing.status === 'failed') {
      throw new Error(`Processing failed: ${rec.processing.error ?? 'unknown error'}`);
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error(
    `Processing did not complete within ${PROCESSING_TIMEOUT_MS}ms (last status: ${lastStatus})`,
  );
}

export async function triggerBuild(): Promise<void> {
  const res = await fetch(`${ADMIN_BASE}/api/build`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(BUILD_TIMEOUT_MS),
  });
  await unwrap<unknown>(res, 'triggerBuild');
}

export async function deleteInterview(id: string): Promise<void> {
  const res = await fetch(`${ADMIN_BASE}/api/interviews/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error(`deleteInterview(${id}) failed: HTTP ${res.status}`);
  }
}
