'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

export interface RecorderProps {
  /** Fired once with the finished recording. */
  onRecorded: (blob: Blob, kind: 'video' | 'audio') => void;
  disabled?: boolean;
}

function pickMimeType(audioOnly: boolean): string | undefined {
  const candidates = audioOnly
    ? ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4']
    : ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, '0')}`;
}

/**
 * Browser recorder over `getUserMedia` + `MediaRecorder`.
 *
 * Camera and microphone by default; audio-only is the same flow with one
 * constraint changed. The showcase plays an audio-only file in the same
 * `<video>` element, so nothing downstream needs to branch on the choice.
 */
export function Recorder({ onRecorded, disabled }: RecorderProps) {
  const [audioOnly, setAudioOnly] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => stopStream, [stopStream]);

  useEffect(() => {
    if (!recording) return;
    const timer = setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, [recording]);

  async function start() {
    setError('');
    setPreview(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: audioOnly ? false : { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current && !audioOnly) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      const mimeType = pickMimeType(audioOnly);
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || (audioOnly ? 'audio/webm' : 'video/webm');
        const blob = new Blob(chunksRef.current, { type });
        stopStream();
        setPreview(URL.createObjectURL(blob));
        onRecorded(blob, audioOnly ? 'audio' : 'video');
      };

      // One-second slices keep memory bounded on a long recording.
      recorder.start(1000);
      setSeconds(0);
      setRecording(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Could not start recording: ${err.message}`
          : 'Could not start recording.',
      );
      stopStream();
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <Box>
      <Flex gap={3} alignItems="center" mb={3} wrap="wrap">
        <Button onClick={recording ? stop : start} disabled={disabled} colorPalette="orange">
          {recording ? `Stop recording (${formatDuration(seconds)})` : 'Start recording'}
        </Button>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <input
            type="checkbox"
            checked={audioOnly}
            disabled={recording || disabled}
            onChange={(event) => setAudioOnly(event.target.checked)}
          />
          Audio only (no camera)
        </label>
      </Flex>

      {/* Plain <video>: Chakra's polymorphic `as` does not carry media element
          props, and these need muted/playsInline/controls to behave. */}
      {!audioOnly && (
        <video
          ref={videoRef}
          muted
          playsInline
          style={{
            width: '100%',
            maxWidth: '640px',
            aspectRatio: '16 / 9',
            background: '#212529',
            borderRadius: '6px',
            display: recording ? 'block' : 'none',
          }}
        />
      )}

      {preview && (
        <Box mt={3}>
          <Text fontSize="sm" color="osuGray" mb={2}>
            Your recording — play it back before you continue.
          </Text>
          <video
            src={preview}
            controls
            style={{
              width: '100%',
              maxWidth: '640px',
              borderRadius: '6px',
              background: '#212529',
            }}
          />
        </Box>
      )}

      {error && (
        <Box mt={3} bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm">
          {error}
        </Box>
      )}
    </Box>
  );
}
