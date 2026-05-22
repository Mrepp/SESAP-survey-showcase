#!/usr/bin/env node
// Live post-deploy smoke. Reads URLs from env, hits public endpoints only,
// never mutates state. Exits non-zero on any failed check.

const ENVS = {
  ADMIN_URL: (process.env.ADMIN_URL ?? '').trim(),
  PROCESSING_URL: (process.env.PROCESSING_URL ?? '').trim(),
  INDEXING_URL: (process.env.INDEXING_URL ?? '').trim(),
  SHOWCASE_URL: (process.env.SHOWCASE_URL ?? '').trim(),
};

const REQUIRED = ['SHOWCASE_URL', 'PROCESSING_URL', 'INDEXING_URL'];
const missing = REQUIRED.filter((k) => !ENVS[k]);
if (missing.length > 0) {
  console.error(`Missing required env var(s): ${missing.join(', ')}`);
  console.error('See tests/smoke/README.md for setup.');
  process.exit(2);
}

const RETRIES = Number(process.env.SMOKE_RETRIES ?? 3);
const DELAY_MS = Number(process.env.SMOKE_DELAY_MS ?? 5000);
const TIMEOUT_MS = Number(process.env.SMOKE_TIMEOUT_MS ?? 10_000);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const stripTrailingSlash = (url) => url.replace(/\/+$/, '');

async function fetchWithRetry(url) {
  let lastErr;
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: 'manual',
      });
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
      if (attempt < RETRIES) await sleep(DELAY_MS);
    }
  }
  throw lastErr;
}

const checks = [];
const check = (name, fn) => checks.push({ name, fn });

function addHealthCheck(workerName, urlKey) {
  const baseUrl = ENVS[urlKey];
  if (!baseUrl) {
    check(`${workerName} /api/health`, async () => ({
      skipped: true,
      reason: `${urlKey} not set`,
    }));
    return;
  }
  check(`${workerName} /api/health`, async () => {
    const res = await fetchWithRetry(`${stripTrailingSlash(baseUrl)}/api/health`);
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) throw new Error(`content-type: ${ct}`);
    const body = await res.json();
    if (body.status !== 'ok') throw new Error(`status=${body.status}`);
    if (body.worker !== workerName) throw new Error(`worker=${body.worker}`);
  });
}

addHealthCheck('sesap-admin', 'ADMIN_URL');
addHealthCheck('sesap-processing', 'PROCESSING_URL');
addHealthCheck('sesap-indexing', 'INDEXING_URL');
addHealthCheck('sesap-showcase', 'SHOWCASE_URL');

if (!ENVS.SHOWCASE_URL) {
  check('showcase GET /', async () => ({ skipped: true, reason: 'SHOWCASE_URL not set' }));
  check('showcase interviews.json', async () => ({ skipped: true, reason: 'SHOWCASE_URL not set' }));
  check('showcase metadata.json', async () => ({ skipped: true, reason: 'SHOWCASE_URL not set' }));
} else {
  const base = stripTrailingSlash(ENVS.SHOWCASE_URL);

  check('showcase GET /', async () => {
    const res = await fetchWithRetry(`${base}/`);
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
    const ct = res.headers.get('content-type') ?? '';
    if (!ct.includes('text/html')) throw new Error(`content-type: ${ct}`);
    const html = await res.text();
    if (!html.includes('<!DOCTYPE html>')) throw new Error('missing doctype');
    if (!html.includes('_next/static/')) throw new Error('missing Next bundle markers');
  });

  check('showcase interviews.json', async () => {
    const res = await fetchWithRetry(`${base}/assets/build/interviews.json`);
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
    const body = await res.json();
    if (!Array.isArray(body)) throw new Error('expected JSON array');
    if (body.length === 0) throw new Error('array is empty');
    const first = body[0];
    if (typeof first?.id !== 'string') throw new Error('first item missing string id');
    if (typeof first?.title !== 'string') throw new Error('first item missing string title');
  });

  check('showcase metadata.json', async () => {
    const res = await fetchWithRetry(`${base}/assets/build/metadata.json`);
    if (res.status !== 200) throw new Error(`expected 200, got ${res.status}`);
    const m = await res.json();
    if (typeof m?.buildId !== 'string') throw new Error('missing string buildId');
    if (typeof m?.interviewCount !== 'number') throw new Error('missing number interviewCount');
    if (!Array.isArray(m?.categories)) throw new Error('categories not array');
    if (!Array.isArray(m?.interviewIds)) throw new Error('interviewIds not array');
  });
}

let failed = 0;
let skipped = 0;
let passed = 0;
for (const { name, fn } of checks) {
  try {
    const result = await fn();
    if (result?.skipped) {
      skipped++;
      console.log(`SKIP ${name}: ${result.reason}`);
    } else {
      passed++;
      console.log(`PASS ${name}`);
    }
  } catch (e) {
    failed++;
    console.error(`FAIL ${name}: ${e.message}`);
  }
}

console.log(`\n${passed} passed, ${skipped} skipped, ${failed} failed`);
if (failed > 0) process.exit(1);
