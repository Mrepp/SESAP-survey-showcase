'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Input, Text, Textarea } from '@chakra-ui/react';
import { ATTRIBUTION_PROMPT, CONSENT_TEXT, CONSENT_VERSION } from '@sesap/core';
import type { AttributionChoice } from '@sesap/types';
import { Recorder } from '../components/Recorder';
import { Turnstile } from '../components/Turnstile';
import { api, uploadInParts } from '../lib/api';
import { extractAudio } from '@sesap/ui-media';
import { PROMPT_SCRIPT, RECORDING_TIPS } from '../lib/prompt-script';

type Step = 'verify' | 'code' | 'profile' | 'consent' | 'capture' | 'done';
type SubmissionMode = 'record-video' | 'record-audio' | 'upload' | 'kaltura';
type SelectedMedia = { blob: Blob; kind: 'video' | 'audio'; name: string };

const MAX_MEDIA_BYTES = 2 * 1024 * 1024 * 1024;
const IS_DRAFT_CONSENT = CONSENT_VERSION.startsWith('draft-');
const ACCEPTED_MEDIA_TYPES = new Set([
  'video/webm',
  'video/mp4',
  'video/quicktime',
  'audio/webm',
  'audio/mpeg',
  'audio/mp4',
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/aac',
  'audio/flac',
  'audio/x-m4a',
]);

const EXTENSION_MEDIA_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  aac: 'audio/aac',
  flac: 'audio/flac',
};

const STEP_ORDER: Step[] = ['verify', 'profile', 'consent', 'capture'];
const STEP_LABELS: Record<Step, string> = {
  verify: 'Verify',
  code: 'Verify',
  profile: 'About you',
  consent: 'Consent',
  capture: 'Add media',
  done: 'Done',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box bg="surface.card" borderRadius="lg" p={6} shadow="sm">
      <Heading size="md" mb={4}>
        {title}
      </Heading>
      {children}
    </Box>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Box mb={4}>
      <Text fontSize="sm" fontWeight="600" mb={1}>
        {label}
      </Text>
      <Input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        bg="surface.input"
        border="1px solid"
        borderColor="gray.200"
      />
    </Box>
  );
}

export function IntakeWizard() {
  const [step, setStep] = useState<Step>('verify');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  // '' before the config call answers, and '' again whenever the widget has no
  // valid token. `turnstileSiteKey === ''` means the worker reported no key,
  // which only a development deployment does.
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [name, setName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [attribution, setAttribution] = useState<AttributionChoice | null>(null);

  const [submissionMode, setSubmissionMode] = useState<SubmissionMode>('record-video');
  const [captureRecording, setCaptureRecording] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [kalturaSource, setKalturaSource] = useState('');
  const [progress, setProgress] = useState('');

  useEffect(() => {
    return () => {
      if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    };
  }, [mediaPreview]);

  useEffect(() => {
    api
      .config()
      .then(({ turnstileSiteKey: key }) => setTurnstileSiteKey(key))
      // A failed config call must not strand the wizard on a blank step; the
      // worker still refuses a token-less request wherever one is required.
      .catch(() => setTurnstileSiteKey(''));
  }, []);

  const handleTurnstileToken = useCallback((token: string) => setTurnstileToken(token), []);

  // Resume: a valid signed cookie restores whichever steps are already done.
  useEffect(() => {
    api
      .session()
      .then(({ session }) => {
        if (!session) return;
        setEmail(session.email);
        setName(session.name ?? '');
        setMajor(session.major ?? '');
        setGraduationYear(session.graduationYear ?? '');
        if (session.submittedInterviewId) {
          // One session, one interview: a reload after submitting must not
          // offer to record again over the interview that already exists.
          setStep('done');
        } else if (session.consent) {
          setAttribution(session.consent.attribution);
          setStep('capture');
        } else if (session.name) {
          setStep('consent');
        } else {
          setStep('profile');
        }
      })
      .catch(() => undefined);
  }, []);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  }

  const submitUpload = () =>
    run(async () => {
      if (submissionMode === 'kaltura') {
        if (!kalturaSource.trim()) throw new Error('Paste a Kaltura link or embed first.');
        setProgress('Checking your Kaltura link…');
        await api.submitKaltura(kalturaSource.trim());
        setStep('done');
        setNotice('');
        setProgress('');
        return;
      }

      if (!selectedMedia) throw new Error('Record or choose a media file first.');

      setProgress('Preparing upload…');
      await api.startUpload(selectedMedia.blob.type);

      setProgress('Uploading your interview…');
      await uploadInParts(selectedMedia.blob, ({ uploadedBytes, totalBytes }) =>
        setProgress(`Uploading… ${Math.round((uploadedBytes / totalBytes) * 100)}%`),
      );

      // The audio track is extracted in the browser so the pipeline transcribes
      // a small mp3 rather than pulling a whole video out of R2.
      setProgress('Extracting the audio track…');
      const audio = await extractAudio(
        new File([selectedMedia.blob], selectedMedia.name, { type: selectedMedia.blob.type }),
        { onProgress: (ratio) => setProgress(`Extracting audio… ${Math.round(ratio * 100)}%`) },
      );
      await api.uploadAudio(audio);

      setProgress('Finishing up…');
      await api.completeUpload();

      setStep('done');
      setNotice('');
      setProgress('');
    });

  function selectMode(mode: SubmissionMode) {
    setSubmissionMode(mode);
    setSelectedMedia(null);
    setMediaPreview(null);
    setKalturaSource('');
    setNotice('');
    setError('');
    setProgress('');
    setCaptureRecording(false);
  }

  function handleFile(file: File | null) {
    setSelectedMedia(null);
    setMediaPreview(null);
    setNotice('');
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const contentType = file.type.toLowerCase() || EXTENSION_MEDIA_TYPES[extension];
    if (!contentType || !ACCEPTED_MEDIA_TYPES.has(contentType)) {
      setError('Choose a supported audio or video file (MP4, MOV, WebM, MP3, M4A, WAV, OGG, AAC, or FLAC).');
      return;
    }
    if (file.size === 0) {
      setError('The selected file is empty.');
      return;
    }
    if (file.size > MAX_MEDIA_BYTES) {
      setError('The selected file is larger than the 2 GB upload limit.');
      return;
    }

    const normalized = file.type === contentType
      ? file
      : new File([file], file.name, { type: contentType, lastModified: file.lastModified });
    const kind = contentType.startsWith('audio/') ? 'audio' : 'video';
    setError('');
    setSelectedMedia({ blob: normalized, kind, name: normalized.name });
    setMediaPreview(URL.createObjectURL(normalized));
    setNotice('File selected. Play it back, then submit when you are ready.');
  }

  return (
    <Box maxW="760px" mx="auto" px={5} py={10}>
      <Heading size="lg" mb={2}>
        Share your engineering student story
      </Heading>
      <Text color="osuGray" mb={6}>
        Tell your story by recording here or uploading an audio or video file.
        After you submit, the SESAP team checks the recording. If it moves
        forward, we will email you a private link to review the written
        description and analysis before the team decides whether to publish it.
      </Text>

      {IS_DRAFT_CONSENT && (
        <Box bg="orange.50" color="orange.900" p={4} borderRadius="md" mb={6}>
          <Text fontWeight="600">Intake is being tested</Text>
          <Text fontSize="sm">
            The consent wording and OSU Library release are still being finalized.
            Please use test material only; do not submit a real story yet.
          </Text>
        </Box>
      )}

      <Flex gap={2} mb={6} wrap="wrap">
        {STEP_ORDER.map((candidate) => {
          const current = STEP_LABELS[step] === STEP_LABELS[candidate];
          const done = STEP_ORDER.indexOf(candidate) < STEP_ORDER.indexOf(step as Step);
          return (
            <Box
              key={candidate}
              px={3}
              py={1}
              borderRadius="full"
              fontSize="xs"
              fontWeight="600"
              bg={current ? 'brand.500' : done ? 'brand.100' : 'surface.input'}
              color={current ? 'white' : 'osuGray'}
            >
              {STEP_LABELS[candidate]}
            </Box>
          );
        })}
      </Flex>

      {error && (
        <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm" mb={4}>
          {error}
        </Box>
      )}
      {notice && (
        <Box bg="blue.50" color="blue.700" p={3} borderRadius="md" fontSize="sm" mb={4}>
          {notice}
        </Box>
      )}

      {step === 'verify' && (
        <Section title="Verify your email">
          <Text fontSize="sm" color="osuGray" mb={4}>
            We will send a six-digit code to this address. We will also use it
            to send your private review link and updates about your submission.
            Your email address will not appear on the public SESAP site.
          </Text>
          <Field
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          {turnstileSiteKey !== null && (
            <Turnstile siteKey={turnstileSiteKey} onToken={handleTurnstileToken} />
          )}
          <Button
            colorPalette="orange"
            // A widget that is rendered but unsolved leaves the token empty, so
            // the button stays disabled rather than sending a request the
            // worker will refuse.
            disabled={
              busy ||
              !email.trim() ||
              turnstileSiteKey === null ||
              (turnstileSiteKey !== '' && !turnstileToken)
            }
            onClick={() =>
              run(async () => {
                await api.startVerification(email.trim(), turnstileToken);
                setNotice('Check your inbox for a six-digit code.');
                setStep('code');
              })
            }
          >
            Send me a code
          </Button>
        </Section>
      )}

      {step === 'code' && (
        <Section title="Enter your code">
          <Field label="Six-digit code from your email" value={code} onChange={setCode} placeholder="000000" />
          <Flex gap={3}>
            <Button
              colorPalette="orange"
              disabled={busy || code.trim().length !== 6}
              onClick={() =>
                run(async () => {
                  await api.confirmVerification(email.trim(), code.trim());
                  setNotice('');
                  setStep('profile');
                })
              }
            >
              Verify
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => setStep('verify')}>
              Use a different address
            </Button>
          </Flex>
        </Section>
      )}

      {step === 'profile' && (
        <Section title="About you">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Program or major" value={major} onChange={setMajor} />
          <Field
            label="Graduation year (actual or expected)"
            value={graduationYear}
            onChange={setGraduationYear}
            placeholder="2024"
          />
          <Button
            colorPalette="orange"
            disabled={busy || !name.trim() || !major.trim() || !graduationYear.trim()}
            onClick={() =>
              run(async () => {
                await api.saveProfile({
                  name: name.trim(),
                  major: major.trim(),
                  graduationYear: graduationYear.trim(),
                });
                setStep('consent');
              })
            }
          >
            Continue
          </Button>
        </Section>
      )}

      {step === 'consent' && (
        <Section title="Consent and release">
          {IS_DRAFT_CONSENT && (
            <Text fontSize="sm" color="red.700" mb={3}>
              This draft agreement tests the intake flow. It is not the final
              OSU Library release. Use test material only.
            </Text>
          )}
          <Textarea
            value={CONSENT_TEXT}
            readOnly
            rows={12}
            bg="surface.input"
            fontSize="sm"
            mb={2}
          />
          <Text fontSize="xs" color="osuGray" mb={4}>
            Version {CONSENT_VERSION}
          </Text>

          <Text fontSize="sm" fontWeight="600" mb={2}>
            {ATTRIBUTION_PROMPT.question}
          </Text>
          {/* Neither option is pre-selected: attribution is an affirmative
              choice, not a default someone can fall through. */}
          <Flex direction="column" gap={2} mb={5}>
            {(['named', 'anonymous'] as const).map((choice) => (
              <label key={choice} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="radio"
                  name="attribution"
                  checked={attribution === choice}
                  onChange={() => setAttribution(choice)}
                />
                <span>{ATTRIBUTION_PROMPT[choice]}</span>
              </label>
            ))}
          </Flex>

          <Button
            colorPalette="orange"
            disabled={busy || attribution === null}
            onClick={() =>
              run(async () => {
                await api.saveConsent(attribution as AttributionChoice);
                setStep('capture');
              })
            }
          >
            I agree — continue
          </Button>
        </Section>
      )}

      {step === 'capture' && (
        <Section title="Add your interview">
          <Text fontSize="sm" color="osuGray" mb={4}>
            You can record here, upload a file you already made, or provide a
            public OSU Kaltura link. Listen to or watch your recording before
            submitting it.
          </Text>
          <Text fontSize="sm" fontWeight="600" mb={2}>
            {PROMPT_SCRIPT.heading}
          </Text>
          <Box as="ol" pl={5} mb={4} fontSize="sm" color="osuGray">
            {PROMPT_SCRIPT.prompts.map((prompt) => (
              <li key={prompt} style={{ marginBottom: '6px' }}>
                {prompt}
              </li>
            ))}
          </Box>
          <Box as="ul" pl={5} mb={5} fontSize="xs" color="osuGray">
            {RECORDING_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </Box>

          <Text fontSize="sm" fontWeight="600" mb={2}>
            How would you like to add it?
          </Text>
          <Flex gap={2} wrap="wrap" mb={5}>
            {([
              ['record-video', 'Record video'],
              ['record-audio', 'Record audio (no camera)'],
              ['upload', 'Upload a file'],
              ['kaltura', 'Kaltura link'],
            ] as const).map(([mode, label]) => (
              <Button
                key={mode}
                size="sm"
                variant={submissionMode === mode ? 'solid' : 'outline'}
                colorPalette={submissionMode === mode ? 'orange' : 'gray'}
                disabled={busy || captureRecording}
                onClick={() => selectMode(mode)}
              >
                {label}
              </Button>
            ))}
          </Flex>

          {(submissionMode === 'record-video' || submissionMode === 'record-audio') && (
            <Recorder
              key={submissionMode}
              kind={submissionMode === 'record-audio' ? 'audio' : 'video'}
              disabled={busy}
              onRecordingChange={setCaptureRecording}
              onRecorded={(blob, kind) => {
                const extension = blob.type.includes('mp4') ? 'mp4' : 'webm';
                setSelectedMedia({ blob, kind, name: `recording.${extension}` });
                setNotice('Recording captured. Submit it when you are ready.');
              }}
            />
          )}

          {submissionMode === 'upload' && (
            <Box>
              <Input
                type="file"
                accept="video/*,audio/*,.m4a,.aac,.flac"
                disabled={busy}
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                bg="surface.input"
                border="1px solid"
                borderColor="gray.200"
                p={1}
              />
              {mediaPreview && selectedMedia && (
                <Box mt={3}>
                  <Text fontSize="sm" color="osuGray" mb={2}>
                    {selectedMedia.name}
                  </Text>
                  {selectedMedia.kind === 'video' ? (
                    <video
                      src={mediaPreview}
                      controls
                      style={{ width: '100%', maxWidth: '640px', borderRadius: '6px' }}
                    />
                  ) : (
                    <audio src={mediaPreview} controls style={{ width: '100%' }} />
                  )}
                </Box>
              )}
            </Box>
          )}

          {submissionMode === 'kaltura' && (
            <Box>
              <Text fontSize="sm" color="osuGray" mb={2}>
                Paste a public OSU Kaltura media page link. The video must be
                available to the SESAP team for review.
              </Text>
              <Textarea
                value={kalturaSource}
                onChange={(event) => setKalturaSource(event.target.value)}
                placeholder="https://media.oregonstate.edu/media/t/1_abcd1234"
                disabled={busy}
                bg="surface.input"
                rows={4}
              />
            </Box>
          )}

          {progress && (
            <Text fontSize="sm" color="osuGray" mt={4}>
              {progress}
            </Text>
          )}

          <Button
            mt={5}
            colorPalette="orange"
            disabled={
              busy ||
              (submissionMode === 'kaltura' ? !kalturaSource.trim() : !selectedMedia)
            }
            onClick={submitUpload}
          >
            Submit my interview
          </Button>
        </Section>
      )}

      {step === 'done' && (
        <Section title="Thank you">
          <Text fontSize="sm" color="osuGray">
            Your recording has been submitted. The SESAP team will review it
            before making a written description and analysis. If it moves
            forward, we will email a private review link to <strong>{email}</strong>.
            You will be able to correct that draft before the team makes a
            publication decision.
          </Text>
        </Section>
      )}
    </Box>
  );
}
