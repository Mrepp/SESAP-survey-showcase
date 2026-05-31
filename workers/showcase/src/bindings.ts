export interface Env {
  AI: Ai;
  AI_NEURON_LIMITER: DurableObjectNamespace;
  ASSETS: Fetcher;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  ENVIRONMENT: string;
  NEXT_DEV_URL?: string;
}
