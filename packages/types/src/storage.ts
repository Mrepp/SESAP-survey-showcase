export const R2_PATHS = {
  transcript: (id: string) => `transcripts/${id}.txt`,
  analysis: (id: string) => `analysis/${id}.json`,
  embeddings: (id: string) => `embeddings/${id}.json`,
  interview: (id: string) => `interview_repository/${id}.json`,
  buildArtifact: (name: string) => `build/${name}`,
} as const;

export const KV_KEYS = {
  interview: (id: string) => `interview:${id}`,
  interviewsList: 'interviews:list',
  buildManifest: 'build:manifest',
  buildDirty: 'build:dirty',
} as const;
