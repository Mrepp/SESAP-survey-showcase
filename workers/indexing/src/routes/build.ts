import { Hono } from 'hono';
import type { Env } from '../bindings';
import type { BuildMetadata } from '@sesap/types';
import { KV_KEYS, R2_PATHS } from '@sesap/types';
import { Logger, ProcessingError } from '@sesap/shared';
import { loadApprovedInterviews } from '../services/aggregator-service';
import { generateCategoryEmbeddings } from '../services/category-embedding-service';
import { buildVectorIndices } from '../services/vector-index-service';
import { clusterByCategory } from '../services/clustering-service';
import { buildLunrIndex } from '../services/lunr-index-service';
import { buildSearchIndex } from '../services/search-index-service';
import { buildManifest } from '../services/manifest-service';

const logger = new Logger({ service: 'build-route' });
const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/build
 * Orchestrate the full indexing pipeline:
 * 1. Load approved interviews with embeddings
 * 2. Generate category embeddings
 * 3. Build vector indices
 * 4. Cluster by category
 * 5. Build Lunr index
 * 6. Build unified search index
 * 7. Build manifest
 * 8. Store all artifacts to R2
 * 9. Update KV with manifest
 */
app.post('/api/build', async (c) => {
  const startTime = Date.now();
  logger.info('Starting indexing build');

  try {
    // Step 1: Load approved interviews with embeddings
    logger.info('Step 1: Loading approved interviews');
    const { interviews, drops } = await loadApprovedInterviews(c.env);

    if (interviews.length === 0) {
      logger.warn('No approved interviews found');
      return c.json({ error: 'No approved interviews to index', drops }, 400);
    }

    logger.info('Loaded approved interviews', {
      count: interviews.length,
      droppedCount: drops.length,
    });

    // Step 2: Generate category embeddings
    logger.info('Step 2: Generating category embeddings');
    const categoryEmbeddings = await generateCategoryEmbeddings(c.env, interviews);
    logger.info('Generated category embeddings', { count: categoryEmbeddings.length });

    // Step 3: Build vector indices
    logger.info('Step 3: Building vector indices');
    const vectorIndices = buildVectorIndices(interviews, categoryEmbeddings);
    logger.info('Built vector indices');

    // Step 4: Cluster by category
    logger.info('Step 4: Clustering by category');
    const clusters = clusterByCategory(vectorIndices);
    logger.info('Clustered by category', { clusterKeys: Object.keys(clusters).length });

    // Step 5: Build Lunr index
    logger.info('Step 5: Building Lunr index');
    const lunrResult = buildLunrIndex(interviews);
    logger.info('Built Lunr index', { documentCount: lunrResult.documents.length });

    // Step 6: Build unified search index
    logger.info('Step 6: Building unified search index');
    const searchIndex = buildSearchIndex(interviews, lunrResult, categoryEmbeddings);
    logger.info('Built search index', { embeddingCount: searchIndex.embeddings.length });

    // Step 7: Extract all unique tags
    const tagsSet = new Set<string>();
    for (const interview of interviews) {
      if (interview.analysis?.quotes) {
        for (const quote of interview.analysis.quotes) {
          for (const tag of quote.tags) {
            tagsSet.add(tag);
          }
        }
      }
    }
    const tags = Array.from(tagsSet);

    // Step 8: Build manifest
    logger.info('Step 7: Building manifest');
    const manifest = buildManifest(interviews, tags);
    logger.info('Built manifest', { buildId: manifest.buildId });

    // Step 9: Store artifacts to R2
    logger.info('Step 8: Storing artifacts to R2');

    await Promise.all([
      // Store vector indices
      c.env.SESAP_BUCKET.put(
        R2_PATHS.buildArtifact('vector-indices.json'),
        JSON.stringify(vectorIndices),
        {
          httpMetadata: { contentType: 'application/json' },
        }
      ),

      // Store clusters
      c.env.SESAP_BUCKET.put(
        R2_PATHS.buildArtifact('clusters.json'),
        JSON.stringify(clusters),
        {
          httpMetadata: { contentType: 'application/json' },
        }
      ),

      // Store search index
      c.env.SESAP_BUCKET.put(
        R2_PATHS.buildArtifact('search-index.json'),
        JSON.stringify(searchIndex),
        {
          httpMetadata: { contentType: 'application/json' },
        }
      ),

      // Store interviews (without full transcript to reduce size)
      c.env.SESAP_BUCKET.put(
        R2_PATHS.buildArtifact('interviews.json'),
        JSON.stringify(
          interviews.map((i) => ({
            id: i.id,
            title: i.title,
            demographics: i.demographics,
            metadata: i.metadata,
            analysis: i.analysis,
          }))
        ),
        {
          httpMetadata: { contentType: 'application/json' },
        }
      ),

      // Store metadata/manifest
      c.env.SESAP_BUCKET.put(
        R2_PATHS.buildArtifact('metadata.json'),
        JSON.stringify(manifest),
        {
          httpMetadata: { contentType: 'application/json' },
        }
      ),
    ]);

    logger.info('Stored artifacts to R2');

    // Step 10: Update KV with build manifest
    logger.info('Step 9: Updating KV with manifest');
    await c.env.SESAP_KV.put(KV_KEYS.buildManifest, JSON.stringify(manifest));
    logger.info('Updated KV with manifest');

    const duration = Date.now() - startTime;
    logger.info('Indexing build complete', {
      buildId: manifest.buildId,
      duration: `${duration}ms`,
    });

    return c.json({
      success: true,
      buildId: manifest.buildId,
      timestamp: manifest.timestamp,
      interviewCount: manifest.interviewCount,
      includedIds: interviews.map((i) => i.id),
      drops,
      duration,
      artifacts: manifest.artifactPaths,
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    logger.error('Indexing build failed', {
      error: err instanceof Error ? err.message : String(err),
      duration: `${duration}ms`,
    });

    if (err instanceof ProcessingError) {
      return c.json({ error: err.message, details: err.details }, 500);
    }

    return c.json(
      {
        error: 'Build failed',
        message: err instanceof Error ? err.message : String(err),
      },
      500
    );
  }
});

/**
 * GET /api/build/status
 * Return the current build manifest from KV
 */
app.get('/api/build/status', async (c) => {
  try {
    const manifestJson = await c.env.SESAP_KV.get(KV_KEYS.buildManifest);

    if (!manifestJson) {
      return c.json({ error: 'No build manifest found' }, 404);
    }

    const manifest: BuildMetadata = JSON.parse(manifestJson);

    return c.json({
      success: true,
      manifest,
    });
  } catch (err) {
    logger.error('Failed to get build status', {
      error: err instanceof Error ? err.message : String(err),
    });

    return c.json(
      {
        error: 'Failed to get build status',
        message: err instanceof Error ? err.message : String(err),
      },
      500
    );
  }
});

export default app;
