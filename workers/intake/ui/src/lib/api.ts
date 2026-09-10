import type { Analysis, IntakeSession, InterviewDraft, SubmitterView } from '@sesap/types';

export type { SubmitterView };

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'same-origin', ...options });
  const body = (await res.json().catch(() => ({}))) as ApiResponse<T>;

  if (!res.ok || !body.success) {
    throw new Error(body.error?.message ?? `Request failed (${res.status})`);
  }
  return body.data as T;
}

function json(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export const api = {
  session(): Promise<{ session: IntakeSession | null }> {
    return request('/api/intake/session');
  },

  /**
   * Public runtime configuration. The Turnstile site key lives here rather than
   * in the bundle because one static export serves every environment.
   */
  config(): Promise<{ turnstileSiteKey: string }> {
    return request('/api/intake/config');
  },

  /**
   * `turnstileToken` is required, not optional. It was optional, and the wizard
   * called this with one argument — so every configuration that actually had
   * bot protection turned on rejected every signup, and the only configuration
   * that worked was the one with no captcha at all. Requiring it here is what
   * makes that regression a type error rather than a silent outage.
   *
   * Pass '' only when the worker reported no site key, which it does only in a
   * development deployment.
   */
  startVerification(email: string, turnstileToken: string): Promise<{ expiresInSeconds: number }> {
    return request('/api/intake/verify/start', json({ email, turnstileToken }));
  },

  confirmVerification(email: string, code: string): Promise<{ email: string }> {
    return request('/api/intake/verify/confirm', json({ email, code }));
  },

  saveProfile(profile: {
    name: string;
    major: string;
    graduationYear: string;
    demographics?: IntakeSession['demographics'];
  }): Promise<IntakeSession> {
    return request('/api/intake/session/profile', json(profile));
  },

  saveConsent(attribution: 'named' | 'anonymous'): Promise<IntakeSession> {
    return request('/api/intake/session/consent', json({ agreed: true, attribution }));
  },

  startUpload(contentType: string): Promise<{ interviewId: string; uploadId: string; key: string }> {
    return request('/api/intake/upload/start', json({ contentType }));
  },

  uploadPart(partNumber: number, chunk: Blob): Promise<{ partNumber: number; received: number }> {
    return request(`/api/intake/upload/part?partNumber=${partNumber}`, {
      method: 'PUT',
      body: chunk,
    });
  },

  uploadAudio(audio: Blob): Promise<{ key: string; sizeBytes: number }> {
    return request('/api/intake/upload/audio', {
      method: 'PUT',
      headers: { 'Content-Type': audio.type || 'audio/mpeg' },
      body: audio,
    });
  },

  completeUpload(kind: 'video' | 'audio'): Promise<{ interviewId: string; email: string }> {
    return request('/api/intake/upload/complete', json({ kind }));
  },

  getReview(token: string): Promise<SubmitterView> {
    return request(`/api/intake/review/${encodeURIComponent(token)}`);
  },

  saveReviewDraft(token: string, draft: InterviewDraft): Promise<{ analysis?: Analysis }> {
    return request(`/api/intake/review/${encodeURIComponent(token)}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
    });
  },

  submitReview(token: string): Promise<{ interviewId: string }> {
    return request(`/api/intake/review/${encodeURIComponent(token)}/submit`, { method: 'POST' });
  },

  logout(): Promise<{ loggedOut: true }> {
    return request('/api/intake/session/logout', { method: 'POST' });
  },
};

/**
 * R2 requires every part except the last to be the same size, and at least
 * 5 MiB. 8 MiB keeps the part count sane for a long recording while staying
 * comfortably under the Workers request-body cap.
 */
export const UPLOAD_PART_SIZE = 8 * 1024 * 1024;

export interface UploadProgress {
  uploadedBytes: number;
  totalBytes: number;
}

/**
 * Send a recording as R2 multipart. Parts are sent in order and each is retried
 * once, so a flaky connection costs a part rather than the whole upload.
 */
export async function uploadInParts(
  file: Blob,
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  const total = file.size;
  let partNumber = 1;

  for (let offset = 0; offset < total; offset += UPLOAD_PART_SIZE) {
    const chunk = file.slice(offset, Math.min(offset + UPLOAD_PART_SIZE, total));
    try {
      await api.uploadPart(partNumber, chunk);
    } catch {
      await api.uploadPart(partNumber, chunk);
    }
    onProgress?.({ uploadedBytes: Math.min(offset + UPLOAD_PART_SIZE, total), totalBytes: total });
    partNumber += 1;
  }
}
