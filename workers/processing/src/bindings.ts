export interface Env {
  AI: Ai;
  AI_NEURON_LIMITER: DurableObjectNamespace;
  SESAP_BUCKET: R2Bucket;
  SESAP_KV: KVNamespace;
  ENVIRONMENT: string;
}
