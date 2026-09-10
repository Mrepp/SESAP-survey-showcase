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

const STEP_ORDER: Step[] = ['verify', 'profile', 'consent', 'capture'];
const STEP_LABELS: Record<Step, string> = {
  verify: 'Verify',
  code: 'Verify',
  profile: 'About you',
  consent: 'Consent',
  capture: 'Record',
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

  const [recording, setRecording] = useState<{ blob: Blob; kind: 'video' | 'audio' } | null>(null);
  const [progress, setProgress] = useState('');

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
      if (!recording) throw new Error('Record something first.');

      setProgress('Preparing upload…');
      await api.startUpload(recording.blob.type || 'video/webm');

      setProgress('Uploading your recording…');
      await uploadInParts(recording.blob, ({ uploadedBytes, totalBytes }) =>
        setProgress(`Uploading… ${Math.round((uploadedBytes / totalBytes) * 100)}%`),
      );

      // The audio track is extracted in the browser so the pipeline transcribes
      // a small mp3 rather than pulling a whole video out of R2.
      setProgress('Extracting the audio track…');
      const audio = await extractAudio(
        new File([recording.blob], 'recording', { type: recording.blob.type }),
        { onProgress: (ratio) => setProgress(`Extracting audio… ${Math.round(ratio * 100)}%`) },
      );
      await api.uploadAudio(audio);

      setProgress('Finishing up…');
      await api.completeUpload(recording.kind);

      setStep('done');
      setNotice('');
      setProgress('');
    });

  return (
    <Box maxW="760px" mx="auto" px={5} py={10}>
      <Heading size="lg" mb={2}>
        Share your Oregon State story
      </Heading>
      <Text color="osuGray" mb={6}>
        Record an interview about your time here. Staff first review submitted
        media; if accepted for analysis, you will read and correct the written
        analysis before anything is published.
      </Text>

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
            We send a six-digit code to confirm you can receive your private
            links. Any valid email address is welcome; your address is never published.
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
          <Field label="Six-digit code" value={code} onChange={setCode} placeholder="000000" />
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
          <Field label="Major" value={major} onChange={setMajor} />
          <Field
            label="Graduation year"
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
        <Section title="Record your interview">
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

          <Recorder
            disabled={busy}
            onRecorded={(blob, kind) => {
              setRecording({ blob, kind });
              setNotice('Recording captured. Submit it when you are ready.');
            }}
          />

          {progress && (
            <Text fontSize="sm" color="osuGray" mt={4}>
              {progress}
            </Text>
          )}

          <Button mt={5} colorPalette="orange" disabled={busy || !recording} onClick={submitUpload}>
            Submit my interview
          </Button>
        </Section>
      )}

      {step === 'done' && (
        <Section title="Thank you">
          <Text fontSize="sm" color="osuGray">
            A program administrator will first review the submitted media. If
            it is accepted for analysis, we will email <strong>{email}</strong>{' '}
            a private link to review and correct the resulting analysis before
            any final approval.
          </Text>
        </Section>
      )}
    </Box>
  );
}
