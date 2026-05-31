import { Hono } from 'hono';
import type { Env } from '../bindings';

const EMBEDDING_MODEL = '@cf/baai/bge-small-en-v1.5';
const MAX_QUERY_LENGTH = 500;

const search = new Hono<{ Bindings: Env }>();

search.post('/api/search/embed', async (c) => {
  if (!c.env.AI) {
    return c.json({ error: 'Semantic search is not configured' }, 503);
  }

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'Request body must be valid JSON' }, 400);
  }

  const query = typeof (body as { query?: unknown }).query === 'string'
    ? (body as { query: string }).query.trim()
    : '';

  if (!query) {
    return c.json({ error: 'Query is required' }, 400);
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return c.json({ error: `Query must be ${MAX_QUERY_LENGTH} characters or fewer` }, 400);
  }

  try {
    const result = (await c.env.AI.run(EMBEDDING_MODEL as Parameters<Ai['run']>[0], {
      text: [query],
    })) as { data?: number[][] };

    const embedding = result.data?.[0];
    if (!Array.isArray(embedding) || embedding.length === 0) {
      return c.json({ error: 'Embedding response was empty' }, 502);
    }

    return c.json({ embedding });
  } catch (err) {
    return c.json(
      {
        error: 'Embedding generation failed',
        message: err instanceof Error ? err.message : String(err),
      },
      502,
    );
  }
});

export { search };
