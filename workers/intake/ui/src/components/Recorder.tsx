'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, Text } from '@chakra-ui/react';

export interface RecorderProps {
  kind: 'video' | 'audio';
  /** Fired once with the finished recording. */
  onRecorded: (blob: Blob, kind: 'video' | 'audio') => void;
  onRecordingChange: (recording: boolean) => void;
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

export function recordingErrorMessage(error: unknown, kind: 'video' | 'audio'): string {
  const device = kind === 'audio' ? 'microphone' : 'camera and microphone';
  const name =
    typeof error === 'object' && error !== null && 'name' in error
      ? String((error as { name?: unknown }).name ?? '')
      : '';

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return `No available ${device} was found. Connect or enable the device, check browser and system permissions, or upload a file instead.`;
  }
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return `Access to your ${device} was blocked. Allow access in your browser and system privacy settings, then try again, or upload a file instead.`;
  }
  if (name === 'NotReadableError' || name === 'AbortError') {
    return `Your ${device} could not be opened. Close other apps using it and try again, or upload a file instead.`;
  }
  if (error instanceof Error && error.message) {
    return `Could not start recording: ${error.message}`;
  }
  return 'Could not start recording. Check your media permissions or upload a file instead.';
}

/**
 * Browser recorder over `getUserMedia` + `MediaRecorder`.
 *
 * The selected kind is explicit so audio-only recording never asks the browser
 * for a camera device or camera permission.
 */
export function Recorder({ kind, onRecorded, onRecordingChange, disabled }: RecorderProps) {
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
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
      if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
        throw new Error('This browser does not support in-page recording. Upload a file instead.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: kind === 'audio' ? false : { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;

      if (videoRef.current && kind === 'video') {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      const mimeType = pickMimeType(kind === 'audio');
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || (kind === 'audio' ? 'audio/webm' : 'video/webm');
        const blob = new Blob(chunksRef.current, { type });
        stopStream();
        setPreview(URL.createObjectURL(blob));
        onRecorded(blob, kind);
        recorderRef.current = null;
      };

      // One-second slices keep memory bounded on a long recording.
      recorder.start(1000);
      setSeconds(0);
      setRecording(true);
      onRecordingChange(true);
    } catch (err) {
      setError(recordingErrorMessage(err, kind));
      setRecording(false);
      onRecordingChange(false);
      recorderRef.current = null;
      stopStream();
    }
  }

  function stop() {
    recorderRef.current?.stop();
    setRecording(false);
    onRecordingChange(false);
  }

  return (
    <Box>
      <Flex gap={3} alignItems="center" mb={3} wrap="wrap">
        <Button onClick={recording ? stop : start} disabled={disabled} colorPalette="orange">
          {recording
            ? `Stop recording (${formatDuration(seconds)})`
            : `Start ${kind} recording`}
        </Button>
      </Flex>

      {/* Plain <video>: Chakra's polymorphic `as` does not carry media element
          props, and these need muted/playsInline/controls to behave. */}
      {kind === 'video' && (
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
          {kind === 'video' ? (
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
          ) : (
            <audio src={preview} controls style={{ width: '100%', maxWidth: '640px' }} />
          )}
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
