// Browser-side video → audio extractor backed by ffmpeg.wasm.
//
// Uses the single-thread build so we don't need COOP/COEP headers on the
// Next.js export served by the admin worker's ASSETS binding.

type FFmpegInstance = {
  load: (opts?: { coreURL?: string; wasmURL?: string }) => Promise<void>;
  writeFile: (path: string, data: Uint8Array) => Promise<void>;
  readFile: (path: string) => Promise<Uint8Array>;
  deleteFile: (path: string) => Promise<void>;
  exec: (args: string[]) => Promise<number>;
  on: (event: string, listener: (...args: unknown[]) => void) => void;
  off?: (event: string, listener: (...args: unknown[]) => void) => void;
};

let cachedFFmpeg: FFmpegInstance | null = null;

async function getFFmpeg(): Promise<FFmpegInstance> {
  if (cachedFFmpeg) return cachedFFmpeg;

  const { FFmpeg } = await import('@ffmpeg/ffmpeg');
  const { toBlobURL } = await import('@ffmpeg/util');

  const ffmpeg = new FFmpeg() as unknown as FFmpegInstance;

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });

  cachedFFmpeg = ffmpeg;
  return ffmpeg;
}

export interface ExtractAudioOptions {
  onProgress?: (ratio: number) => void;
}

export async function extractAudio(
  videoFile: File,
  options: ExtractAudioOptions = {},
): Promise<File> {
  const ffmpeg = await getFFmpeg();

  const progressListener = (...args: unknown[]) => {
    const event = args[0] as { progress?: number } | undefined;
    if (event && typeof event.progress === 'number' && options.onProgress) {
      options.onProgress(Math.max(0, Math.min(1, event.progress)));
    }
  };
  ffmpeg.on('progress', progressListener);

  const ext = videoFile.name.split('.').pop()?.toLowerCase() || 'mp4';
  const inputName = `input.${ext}`;
  const outputName = 'audio.mp3';

  try {
    const bytes = new Uint8Array(await videoFile.arrayBuffer());
    await ffmpeg.writeFile(inputName, bytes);

    // Mono, 16 kHz, 32 kbps MP3 — Whisper-friendly speech encoding.
    await ffmpeg.exec([
      '-i', inputName,
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'libmp3lame',
      '-b:a', '32k',
      outputName,
    ]);

    const data = (await ffmpeg.readFile(outputName)) as Uint8Array;
    await ffmpeg.deleteFile(inputName).catch(() => undefined);
    await ffmpeg.deleteFile(outputName).catch(() => undefined);

    const audioBlob = new Blob([data as BlobPart], { type: 'audio/mpeg' });
    const audioName = videoFile.name.replace(/\.[^.]+$/, '') + '.mp3';
    return new File([audioBlob], audioName, { type: 'audio/mpeg' });
  } finally {
    if (ffmpeg.off) ffmpeg.off('progress', progressListener);
  }
}
