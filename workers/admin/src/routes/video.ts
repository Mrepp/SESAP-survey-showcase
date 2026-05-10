import { Hono } from 'hono';
import type { Env } from '../bindings';

const videos = new Hono<{ Bindings: Env }>();

// Create metadata
videos.post('/api/videos/upload-url', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));

    const filename = body.filename || 'video.mp4';
    const contentType = body.contentType || 'video/mp4';

    // Allowed file types
    const allowed = [
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];

    if (!allowed.includes(contentType)) {
      return c.json(
        {
          error: 'Unsupported file type'
        },
        400
      );
    }

    const extension = filename.split('.').pop() || 'mp4';

    const videoId = crypto.randomUUID();

    const key = `videos/raw/${videoId}.${extension}`;

    // Store metadata
    await c.env.SESAP_KV.put(
      `video:${videoId}`,
      JSON.stringify({
        id: videoId,
        filename,
        key,
        contentType,
        status: 'pending-upload',
        createdAt: new Date().toISOString()
      })
    );

    return c.json({
      success: true,
      videoId,
      key
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        error: 'Failed to create upload'
      },
      500
    );
  }
});

// Upload actual video file
videos.put('/api/videos/upload/:id', async (c) => {
  try {
    const id = c.req.param('id');

    const metadata = await c.env.SESAP_KV.get(`video:${id}`);

    if (!metadata) {
      return c.json(
        {
          error: 'Video not found'
        },
        404
      );
    }

    const video = JSON.parse(metadata);

    const body = await c.req.arrayBuffer();

    await c.env.SESAP_BUCKET.put(video.key, body, {
      httpMetadata: {
        contentType: video.contentType
      }
    });

    video.status = 'uploaded';
    video.uploadedAt = new Date().toISOString();

    await c.env.SESAP_KV.put(
      `video:${id}`,
      JSON.stringify(video)
    );

    // Queue processing
    await c.env.PROCESSING_QUEUE.send({
    interviewId: id,
    queuedAt: new Date().toISOString(),
    metadata: {
        triggeredBy: 'video-upload',
        reason: 'new_upload'
  }
});

    return c.json({
      success: true,
      uploaded: true
    });
  } catch (error) {
    console.error(error);

    return c.json(
      {
        error: 'Upload failed'
      },
      500
    );
  }
});

// Get single video
videos.get('/api/videos/:id', async (c) => {
  const id = c.req.param('id');

  const data = await c.env.SESAP_KV.get(`video:${id}`);

  if (!data) {
    return c.json(
      {
        error: 'Video not found'
      },
      404
    );
  }

  return c.json(JSON.parse(data));
});

// List all videos
videos.get('/api/videos', async (c) => {
  const list = await c.env.SESAP_KV.list({
    prefix: 'video:'
  });

  const results = await Promise.all(
    list.keys.map(async (key) => {
      const value = await c.env.SESAP_KV.get(key.name);

      return value ? JSON.parse(value) : null;
    })
  );

  return c.json(results.filter(Boolean));
});

// Mark upload complete manually
videos.post('/api/videos/:id/complete', async (c) => {
  const id = c.req.param('id');

  const data = await c.env.SESAP_KV.get(`video:${id}`);

  if (!data) {
    return c.json(
      {
        error: 'Video not found'
      },
      404
    );
  }

  const video = JSON.parse(data);

  video.status = 'processed';
  video.processedAt = new Date().toISOString();

  await c.env.SESAP_KV.put(
    `video:${id}`,
    JSON.stringify(video)
  );

  return c.json({
    success: true
  });
});

export { videos };
