'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Flex, Text, Button, Input, Textarea } from '@chakra-ui/react';
import { api } from '../api/interviews';
import { extractAudio } from '../lib/extractAudio';
import { previewVideoEmbed } from '../lib/kalturaPreview';

type Mode = 'url' | 'video' | 'transcript';

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <Box mb={4}>
      <Text fontSize="sm" fontWeight="500" color="gray.600" mb={1.5}>
        {label} {required && <Text as="span" color="red.500">*</Text>}
      </Text>
      {children}
    </Box>
  );
}

function ModeRadio({
  active,
  onClick,
  disabled = false,
  label,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  label: string;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        width: '100%',
        padding: '10px 12px',
        border: '1px solid',
        borderColor: active ? 'var(--chakra-colors-brand-500)' : 'var(--chakra-colors-gray-200)',
        background: active ? 'var(--chakra-colors-brand-50)' : 'white',
        borderRadius: '6px',
        textAlign: 'left',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: '2px solid',
          borderColor: active ? 'var(--chakra-colors-brand-500)' : 'var(--chakra-colors-gray-300)',
          background: active ? 'var(--chakra-colors-brand-500)' : 'white',
          flexShrink: 0,
        }}
      />
      <Box flex={1}>
        <Text fontSize="sm" fontWeight="600" color={active ? 'brand.700' : 'gray.800'}>
          {label}
        </Text>
        {hint && (
          <Text fontSize="xs" color="gray.500">
            {hint}
          </Text>
        )}
      </Box>
    </button>
  );
}

export function Upload() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<Mode>('url');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractProgress, setExtractProgress] = useState(0);

  const videoPreview = previewVideoEmbed(videoUrl);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    setError('');
  }, [mode]);

  async function handleVideoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setVideoFile(file);
    setAudioFile(null);
    setExtractProgress(0);

    if (!file) return;

    setExtracting(true);
    setError('');
    try {
      const audio = await extractAudio(file, {
        onProgress: (ratio) => setExtractProgress(ratio),
      });
      setAudioFile(audio);
      setExtractProgress(1);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Audio extraction failed: ${err.message}`
          : 'Audio extraction failed',
      );
      setVideoFile(null);
    } finally {
      setExtracting(false);
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const form = e.currentTarget;
    const fd = new FormData(form);
    const interviewUrlValue = fd.get('interviewURL');
    const videoEmbed = typeof interviewUrlValue === 'string' ? interviewUrlValue.trim() : '';
    const isKalturaEmbed = videoEmbed ? previewVideoEmbed(videoEmbed).provider === 'kaltura' : false;

    const metadata = {
      title: fd.get('title'),
      demographics: {},
      metadata: {
        interviewDate: fd.get('interviewDate'),
        ...(fd.get('interviewer') ? { interviewer: fd.get('interviewer') } : {}),
        ...(videoEmbed ? { interviewURL: videoEmbed } : {}),
        ...(fd.get('notes') ? { notes: fd.get('notes') } : {}),
      },
    };

    try {
      if (mode === 'url') {
        if (!videoEmbed) {
          throw new Error('Paste a Kaltura URL or embed iframe');
        }
        if (!isKalturaEmbed) {
          throw new Error('Only Kaltura links can be transcribed from URL mode. Use video or transcript mode to save this embed for playback.');
        }
        await api.uploadInterview(metadata, {
          source: 'kaltura',
          kalturaSource: videoEmbed,
        });
      } else if (mode === 'video') {
        if (!audioFile) {
          throw new Error('Audio is still being extracted from the video');
        }
        await api.uploadInterview(metadata, { source: 'audio', audioFile, videoEmbed });
      } else {
        const transcriptFile = fd.get('transcript') as File | null;
        if (!transcriptFile || !transcriptFile.name) {
          throw new Error('Please choose a transcript file');
        }
        await api.uploadInterview(metadata, { source: 'transcript', transcriptFile, videoEmbed });
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyles = {
    bg: 'surface.input',
    border: '1px solid',
    borderColor: 'gray.200',
    _focus: { borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' },
  };

  const submitDisabled =
    !hydrated ||
    submitting ||
    (mode === 'video' && (extracting || !audioFile));

  return (
    <Box maxW="800px" mx="auto" p={6}>
      <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="gray.800" mb={6}>
        Upload New Interview
      </Text>

      <Text fontSize="sm" color="gray.500" mb={6}>
        Demographics (college, major, etc.) are detected from the transcript automatically. You can review and edit them on the interview's review page.
      </Text>

      {error && (
        <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm" mb={4}>
          {error}
        </Box>
      )}

      <Box bg="white" borderRadius="lg" border="1px solid" borderColor="gray.100" p={6}>
        <form onSubmit={handleSubmit}>
          <Field label="Interview Title" required>
            <Input
              name="title"
              required
              disabled={!hydrated || submitting}
              placeholder="e.g., John Doe - CS 2024"
              {...inputStyles}
            />
          </Field>

          <Flex gap={4}>
            <Box flex={1}>
              <Field label="Interview Date" required>
                <Input
                  name="interviewDate"
                  type="date"
                  required
                  disabled={!hydrated || submitting}
                  {...inputStyles}
                />
              </Field>
            </Box>
            <Box flex={1}>
              <Field label="Interviewer">
                <Input
                  name="interviewer"
                  disabled={!hydrated || submitting}
                  placeholder="Leave blank for self-directed"
                  {...inputStyles}
                />
              </Field>
            </Box>
          </Flex>

          <Field label="Video embed or URL">
            <Textarea
              name="interviewURL"
              rows={4}
              value={videoUrl}
              disabled={!hydrated || submitting}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Paste a Kaltura, YouTube, Vimeo, or HTTPS iframe embed"
              {...inputStyles}
            />
            <Text fontSize="xs" color="gray.500" mt={1}>
              Tip: URL-only transcription supports Kaltura. Other embeds can be saved with video or transcript uploads for playback.
              {mode === 'url' && videoUrl.trim() && (
                <>
                  {' '}
                  <Text
                    as="span"
                    color={videoPreview.ok ? 'green.600' : 'red.600'}
                    fontWeight="500"
                  >
                    {videoPreview.ok
                      ? `Detected ${videoPreview.provider}${videoPreview.entryId ? ` entry ${videoPreview.entryId}` : ''}`
                      : 'No supported embed detected'}
                  </Text>
                </>
              )}
            </Text>
          </Field>

          <Box mb={4}>
            <Text fontSize="sm" fontWeight="500" color="gray.600" mb={1.5}>
              Or use a different source
            </Text>
            <Flex direction="column" gap={2}>
              <ModeRadio
                active={mode === 'url'}
                onClick={() => setMode('url')}
                disabled={!hydrated || submitting}
                label="Use a Kaltura URL for transcription"
                hint="Default. The processing worker fetches and transcribes via Whisper."
              />
              <ModeRadio
                active={mode === 'video'}
                onClick={() => setMode('video')}
                disabled={!hydrated || submitting}
                label="Upload a video file"
                hint="Audio is extracted in your browser; the video itself never uploads."
              />
              <ModeRadio
                active={mode === 'transcript'}
                onClick={() => setMode('transcript')}
                disabled={!hydrated || submitting}
                label="Upload a transcript file (.txt / .md)"
                hint="Skip transcription and go straight to analysis."
              />
            </Flex>
          </Box>

          {mode === 'video' && (
            <Field label="Video File" required>
              <Input
                name="video"
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={handleVideoChange}
                disabled={!hydrated || submitting}
                pt={1.5}
                {...inputStyles}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>
                Accepts .mp4, .webm, .mov.
              </Text>
              {videoFile && extracting && (
                <Box mt={3}>
                  <Text fontSize="xs" color="gray.600" mb={1}>
                    Extracting audio… {Math.round(extractProgress * 100)}%
                  </Text>
                  <Box bg="gray.100" h="6px" borderRadius="full" overflow="hidden">
                    <Box
                      bg="brand.500"
                      h="100%"
                      width={`${Math.round(extractProgress * 100)}%`}
                      transition="width 200ms"
                    />
                  </Box>
                </Box>
              )}
              {audioFile && !extracting && (
                <Text fontSize="xs" color="green.600" mt={2}>
                  Audio ready ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                </Text>
              )}
            </Field>
          )}

          {mode === 'transcript' && (
            <Field label="Transcript File" required>
              <Input
                name="transcript"
                type="file"
                accept=".txt,.md"
                required
                disabled={!hydrated || submitting}
                pt={1.5}
                {...inputStyles}
              />
              <Text fontSize="xs" color="gray.500" mt={1}>Accepts .txt, .md</Text>
            </Field>
          )}

          <Field label="Notes">
            <Textarea
              name="notes"
              disabled={!hydrated || submitting}
              placeholder="Additional notes..."
              rows={3}
              {...inputStyles}
            />
          </Field>

          <Flex gap={3} mt={2}>
            <Button type="submit" colorPalette="blue" disabled={submitDisabled}>
              {submitting ? 'Uploading...' : extracting ? 'Extracting audio…' : 'Upload Interview'}
            </Button>
            <Button variant="outline" onClick={() => router.push('/')}>
              Cancel
            </Button>
          </Flex>
        </form>
      </Box>
    </Box>
  );
}
