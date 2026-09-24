#!/usr/bin/env node

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';

const PORT = Number(process.env.AI_BRIDGE_PORT ?? 8799);
const MAX_BODY_BYTES = 1_000_000;
const EMBEDDING_DIMENSION = 384;
const MODELS = {
  llm: '@cf/openai/gpt-oss-120b',
  embedding: '@cf/baai/bge-small-en-v1.5',
  whisper: '@cf/openai/whisper-large-v3-turbo',
};

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
}

function deterministicEmbedding(text) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  const vector = new Array(EMBEDDING_DIMENSION);
  for (let index = 0; index < EMBEDDING_DIMENSION; index++) {
    hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
    vector[index] = ((hash >>> 0) % 1000) / 1000;
  }
  return vector;
}

function runClaude(input) {
  const prompt = typeof input.prompt === 'string' ? input.prompt : JSON.stringify(input);
  return new Promise((resolve, reject) => {
    const child = spawn('claude', ['--print', prompt], { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('close', (code) => {
      if (code === 0) resolve(stdout.trim());
      else reject(new Error(stderr.trim() || `claude exited with status ${code}`));
    });
  });
}

createServer(async (request, response) => {
  if (request.method !== 'POST' || request.url !== '/run') {
    json(response, 404, { error: 'POST /run is the only endpoint.' });
    return;
  }

  let body = '';
  for await (const chunk of request) {
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      json(response, 413, { error: 'Request body is too large.' });
      request.destroy();
      return;
    }
  }

  try {
    const { model, input = {} } = JSON.parse(body);
    if (model === MODELS.embedding) {
      const texts = Array.isArray(input.text) ? input.text : [input.text ?? ''];
      json(response, 200, {
        shape: [texts.length, EMBEDDING_DIMENSION],
        data: texts.map((text) => deterministicEmbedding(String(text))),
      });
      return;
    }
    if (model === MODELS.whisper) {
      json(response, 501, { error: 'The local bridge cannot transcribe audio; use AI_MODE=fixture or live.' });
      return;
    }
    if (model !== MODELS.llm) {
      json(response, 400, { error: `Unsupported model: ${String(model)}` });
      return;
    }
    json(response, 200, { response: await runClaude(input) });
  } catch (error) {
    json(response, 500, { error: error instanceof Error ? error.message : String(error) });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`SESAP AI bridge listening on http://127.0.0.1:${PORT}`);
});
