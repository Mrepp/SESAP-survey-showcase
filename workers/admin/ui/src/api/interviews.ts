import type { InterviewRecord, Analysis, Demographics, InterviewMetadata, BuildDirtyState, BuildMetadata } from '@sesap/types';

export type InterviewRecordWithStale = InterviewRecord & {
  stale: boolean;
  staleReasons: string[];
};

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      const body = await res.json().catch(() => ({}));
      const message = (body as ApiResponse<unknown>).error?.message ?? 'Authentication required';
      window.location.href = `/auth-error?message=${encodeURIComponent(message)}`;
      throw new Error(message);
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
  listInterviews(): Promise<InterviewRecordWithStale[]> {
    return request('/api/interviews');
  },

  getInterview(id: string): Promise<InterviewRecordWithStale> {
    return request(`/api/interviews/${id}`);
  },

  acceptCurrentStamp(id: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/accept-current-stamp`, { method: 'POST' });
  },

  reprocessInterview(id: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/reprocess`, { method: 'POST' });
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

  saveTitle(id: string, title: string): Promise<InterviewRecord> {
    return request(`/api/interviews/${id}/title`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
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

  async uploadInterview(
    metadata: unknown,
    payload:
      | { source: 'transcript'; transcriptFile: File; videoEmbed?: string }
      | { source: 'audio'; audioFile: File; videoEmbed?: string }
      | { source: 'kaltura'; kalturaSource: string },
  ): Promise<InterviewRecord> {
    const formData = new FormData();
    formData.append('metadata', JSON.stringify(metadata));
    formData.append('source', payload.source);
    if (payload.source === 'transcript') {
      formData.append('transcript', payload.transcriptFile);
      if (payload.videoEmbed) formData.append('videoEmbed', payload.videoEmbed);
    } else if (payload.source === 'audio') {
      formData.append('audio', payload.audioFile);
      if (payload.videoEmbed) formData.append('videoEmbed', payload.videoEmbed);
    } else {
      formData.append('kalturaSource', payload.kalturaSource);
    }
    return request('/api/interviews', { method: 'POST', body: formData });
  },

  deleteInterview(id: string): Promise<{ deleted: string }> {
    return request(`/api/interviews/${id}`, { method: 'DELETE' });
  },

  triggerBuild(): Promise<{
    buildId: string;
    timestamp: string;
    interviewCount: number;
    includedIds?: string[];
    drops?: { id: string; reason: string }[];
  }> {
    return request('/api/build', { method: 'POST' });
  },

  getBuildStatus(): Promise<{ dirty: BuildDirtyState | null; manifest: BuildMetadata | null; showcaseUrl: string }> {
    return request('/api/build/status');
  },
};
