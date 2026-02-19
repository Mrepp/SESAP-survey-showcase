import type { InterviewRecord, Analysis, Demographics, InterviewMetadata, BuildDirtyState, BuildMetadata } from '@sesap/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      window.location.reload();
      throw new Error('Authentication required');
    }
    const body = await res.json().catch(() => ({}));
    throw new Error(
      (body as ApiResponse<unknown>).error?.message ?? `Request failed (${res.status})`
    );
  }
  const body: ApiResponse<T> = await res.json();
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Request failed');
  }
  return body.data as T;
}

export const api = {
  listInterviews(): Promise<InterviewRecord[]> {
    return request('/api/interviews');
  },

  getInterview(id: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}`);
  },

  async getTranscript(id: string): Promise<string> {
    const res = await fetch(`/api/interviews/${id}/transcript`);
    if (!res.ok) throw new Error('Failed to load transcript');
    return res.text();
  },

  getAnalysis(id: string): Promise<Analysis> {
    return request(`/api/interviews/${id}/analysis`);
  },

  saveAnalysis(id: string, analysis: Analysis): Promise<Analysis> {
    return request(`/api/interviews/${id}/analysis`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysis),
    });
  },

  saveDemographics(id: string, demographics: Demographics): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/demographics`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demographics),
    });
  },

  saveMetadata(id: string, metadata: InterviewMetadata): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/metadata`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
  },

  approveInterview(id: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/approve`, { method: 'POST' });
  },

  rejectInterview(id: string, reason: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
  },

  async uploadInterview(metadata: unknown, transcriptFile: File): Promise<InterviewRecord> {
    const formData = new FormData();
    formData.append('transcript', transcriptFile);
    formData.append('metadata', JSON.stringify(metadata));
    return request('/api/interviews', { method: 'POST', body: formData });
  },

  deleteInterview(id: string): Promise<{ deleted: string }> {
    return request(`/api/interviews/${id}`, { method: 'DELETE' });
  },

  triggerBuild(): Promise<unknown> {
    return request('/api/build', { method: 'POST' });
  },

  getBuildStatus(): Promise<{ dirty: BuildDirtyState | null; manifest: BuildMetadata | null; showcaseUrl: string }> {
    return request('/api/build/status');
  },
};
