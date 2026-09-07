'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Flex, Text, Spinner, Code, Input, Textarea } from '@chakra-ui/react';
import type { BuildMetadata, InterviewDraft } from '@sesap/types';
import {
  AnalysisEditorTabs,
  InvalidThemeTitleError,
  ReviewFooterBar,
  useAnalysisDraft,
  type AnalysisDraftInitial,
  type EditorTab,
} from '@sesap/analysis-editor';
import { api, type InterviewRecordWithStale } from '../api/interviews';
import { StatusBadge } from '../components/StatusBadge';

export function Review() {
  const searchParams = useSearchParams();
  const id = searchParams?.get('id') ?? undefined;
  const router = useRouter();

  const [interview, setInterview] = useState<InterviewRecordWithStale | null>(null);
  const [initial, setInitial] = useState<AnalysisDraftInitial | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<EditorTab>('overview');
  const [busy, setBusy] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [buildManifest, setBuildManifest] = useState<BuildMetadata | null>(null);

  const onSave = useCallback(
    async (draft: InterviewDraft) => {
      if (!id) return;
      const { record, analysis } = await api.saveDraft(id, draft);
      setInterview((previous) =>
        previous ? { ...record, stale: false, staleReasons: [] } : previous,
      );
      return { analysis };
    },
    [id],
  );

  const draft = useAnalysisDraft({ initial, onSave });
  const saving = draft.saving || busy;

  const canApprove = interview
    ? interview.processing.status === 'completed' && interview.approval.status === 'pending_review'
    : false;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    api
      .getBuildStatus()
      .then((s) => setBuildManifest(s.manifest))
      .catch(() => setBuildManifest(null));

    api
      .getInterview(id)
      .then(async (rec) => {
        setInterview(rec);

        let transcriptText = '';
        if (rec.artifacts.transcript) {
          try {
            transcriptText = await api.getTranscript(id);
          } catch {
            // Transcript not yet readable; leave empty so the in-progress
            // banner shows instead of a hard failure.
          }
        }
        setTranscript(transcriptText);

        let analysis = null;
        if (rec.processing.status === 'completed') {
          try {
            analysis = await api.getAnalysis(id);
          } catch {
            // Analysis not ready yet.
          }
        }

        setInitial({
          title: rec.title,
          demographics: rec.demographics,
          metadata: rec.metadata,
          analysis,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-dismiss alerts
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const showAlert = useCallback((type: 'success' | 'error', message: string) => {
    setAlert({ type, message });
  }, []);

  async function handleSave() {
    if (!interview) return;
    try {
      await draft.save();
      showAlert(
        'success',
        interview.approval.status === 'approved'
          ? 'Corrections saved. Indexes are now out of date — publish changes from the dashboard.'
          : 'Corrections saved successfully.',
      );
    } catch (err) {
      if (err instanceof InvalidThemeTitleError) setActiveTab('themes');
      showAlert('error', err instanceof Error ? err.message : 'Save failed');
    }
  }

  /** Runs one admin action, funnelling failures into the alert bar. */
  async function run(action: () => Promise<string>) {
    setBusy(true);
    try {
      showAlert('success', await action());
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusy(false);
    }
  }

  function applyRecord(rec: InterviewRecordWithStale | Awaited<ReturnType<typeof api.approveInterview>>) {
    setInterview((previous) => ({
      ...rec,
      stale: previous?.stale ?? false,
      staleReasons: previous?.staleReasons ?? [],
    }));
  }

  async function handleApprove() {
    if (!id || !confirm('Approve this interview with the current analysis?')) return;
    await run(async () => {
      applyRecord(await api.approveInterview(id));
      return 'Interview approved!';
    });
  }

  async function handleReject() {
    if (!id || !rejectReason.trim()) return;
    await run(async () => {
      applyRecord(await api.rejectInterview(id, rejectReason.trim()));
      setRejectModalOpen(false);
      setRejectReason('');
      return 'Interview rejected.';
    });
  }

  async function handleDelete() {
    if (!id || !confirm('Permanently delete this interview? This cannot be undone.')) return;
    await run(async () => {
      await api.deleteInterview(id);
      setTimeout(() => router.push('/'), 1500);
      return 'Interview deleted.';
    });
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (error || !interview) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
        <Box bg="red.50" color="red.700" p={4} borderRadius="md">
          {error || 'Interview not found'}
        </Box>
      </Box>
    );
  }

  const header = (
    <>
      {alert && (
        <Box px={6} pt={4}>
          <Box
            bg={alert.type === 'success' ? 'green.50' : 'red.50'}
            color={alert.type === 'success' ? 'green.700' : 'red.700'}
            p={3}
            borderRadius="md"
            fontSize="sm"
            border="1px solid"
            borderColor={alert.type === 'success' ? 'green.200' : 'red.200'}
          >
            {alert.message}
          </Box>
        </Box>
      )}

      {rejectModalOpen && (
        <Box
          position="fixed"
          inset={0}
          bg="blackAlpha.600"
          zIndex={50}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setRejectModalOpen(false)}
        >
          <Box
            bg="white"
            borderRadius="lg"
            p={6}
            w="500px"
            maxW="90vw"
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontFamily="heading" fontSize="lg" fontWeight="600" mb={3}>
              Reject Interview
            </Text>
            <Text fontSize="sm" color="gray.600" mb={3}>
              Please provide a reason for rejection:
            </Text>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              mb={4}
              bg="surface.input"
              border="1px solid"
              borderColor="gray.200"
              placeholder="Reason for rejection..."
            />
            <Flex gap={3} justifyContent="flex-end">
              <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button
                colorPalette="red"
                size="sm"
                onClick={handleReject}
                disabled={!rejectReason.trim() || saving}
              >
                {saving ? 'Rejecting...' : 'Confirm Rejection'}
              </Button>
            </Flex>
          </Box>
        </Box>
      )}
    </>
  );

  const overview = (
    <Box>
      <Input
        value={draft.title}
        onChange={(e) => draft.setTitle(e.target.value)}
        fontFamily="heading"
        fontSize="2xl"
        fontWeight="700"
        color="gray.800"
        mb={4}
        bg="transparent"
        border="1px solid transparent"
        borderRadius="md"
        px={2}
        _hover={{ borderColor: 'gray.200' }}
        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px {colors.brand.500}', bg: 'white' }}
        aria-label="Interview title"
      />

      <Flex gap={3} mb={6}>
        <StatusBadge status={interview.processing.status} />
        {(interview.processing.status === 'completed' ||
          interview.processing.status === 'failed') && (
          <StatusBadge status={interview.approval.status} />
        )}
        {interview.approval.status === 'approved' &&
          (buildManifest === null || Array.isArray(buildManifest.interviewIds)) &&
          !(buildManifest?.interviewIds ?? []).includes(interview.id) && (
            <StatusBadge status="not_published" />
          )}
        {interview.stale && <StatusBadge status="out_of_sync" />}
      </Flex>

      {interview.stale && (
        <Box
          bg="yellow.50"
          border="1px solid"
          borderColor="yellow.300"
          color="yellow.900"
          p={4}
          borderRadius="md"
          mb={4}
        >
          <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap="wrap">
            <Box flex={1} minW="240px">
              <Text fontSize="sm" fontWeight={600} mb={1}>
                Out of sync with current prompt / schema
              </Text>
              <Text fontSize="xs" color="yellow.800">
                This analysis was generated under an older version
                {interview.staleReasons.length > 0
                  ? ` (${interview.staleReasons.join(', ')})`
                  : ''}
                . Reprocess to regenerate with the current prompt, or accept the current stamp if
                you&apos;ve manually verified the existing analysis is still good.
              </Text>
            </Box>
            <Flex gap={2} flexShrink={0}>
              <Button
                size="sm"
                colorPalette="yellow"
                variant="outline"
                disabled={saving}
                onClick={async () => {
                  if (!id || !confirm('Mark this interview as up-to-date without reprocessing?'))
                    return;
                  await run(async () => {
                    const rec = await api.acceptCurrentStamp(id);
                    setInterview({ ...rec, stale: false, staleReasons: [] });
                    return 'Stamp accepted as current.';
                  });
                }}
              >
                Accept current
              </Button>
              <Button
                size="sm"
                colorPalette="yellow"
                disabled={saving}
                onClick={async () => {
                  if (!id || !confirm('Reprocess this interview with the current prompt and schema?'))
                    return;
                  await run(async () => {
                    await api.reprocessInterview(id);
                    return 'Reprocessing queued. Refresh in a moment.';
                  });
                }}
              >
                Reprocess
              </Button>
            </Flex>
          </Flex>
        </Box>
      )}

      {interview.processing.error && (
        <Box
          bg="red.50"
          color="red.700"
          p={3}
          borderRadius="md"
          fontSize="sm"
          mb={4}
          border="1px solid"
          borderColor="red.200"
        >
          <strong>Processing Error:</strong> {interview.processing.error}
        </Box>
      )}

      {interview.approval.status === 'rejected' && interview.approval.rejectionReason && (
        <Box
          bg="red.50"
          color="red.700"
          p={3}
          borderRadius="md"
          fontSize="sm"
          mb={4}
          border="1px solid"
          borderColor="red.200"
        >
          <Text mb={3}>
            <strong>Rejection Reason:</strong> {interview.approval.rejectionReason}
          </Text>
          <Flex gap={2}>
            <Button
              size="sm"
              colorPalette="yellow"
              variant="outline"
              disabled={saving}
              onClick={async () => {
                if (
                  !id ||
                  !confirm(
                    'Re-run AI analysis on this rejected interview? It will return to pending review afterward.',
                  )
                )
                  return;
                await run(async () => {
                  await api.reprocessInterview(id);
                  setInterview(await api.getInterview(id));
                  return 'Reprocessing queued. Refresh in a moment.';
                });
              }}
            >
              Reprocess
            </Button>
            <Button
              size="sm"
              colorPalette="green"
              disabled={saving}
              onClick={async () => {
                if (
                  !id ||
                  !confirm(
                    'Approve this previously-rejected interview using the current edits? This will mark indexes dirty for rebuild.',
                  )
                )
                  return;
                await run(async () => {
                  applyRecord(await api.approveInterview(id));
                  return 'Interview approved with edits.';
                });
              }}
            >
              Approve with edits
            </Button>
          </Flex>
        </Box>
      )}

      <Box mb={6}>
        <Text
          fontFamily="heading"
          fontSize="lg"
          fontWeight="600"
          color="gray.700"
          mb={3}
          borderBottom="2px solid"
          borderColor="gray.100"
          pb={2}
        >
          Interview Info
        </Text>
        <Flex wrap="wrap" gap={4}>
          <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              Interview ID
            </Text>
            <Text fontSize="sm" fontWeight="500" color="gray.800">
              {interview.id}
            </Text>
          </Box>
          <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              fontWeight="600"
              letterSpacing="0.05em"
              mb={1}
            >
              Date
            </Text>
            <Input
              size="sm"
              type="date"
              value={draft.metadata.interviewDate}
              onChange={(e) => draft.setMetadataField('interviewDate', e.target.value)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px {colors.brand.500}' }}
            />
          </Box>
          <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              fontWeight="600"
              letterSpacing="0.05em"
              mb={1}
            >
              Interviewer
            </Text>
            <Input
              size="sm"
              value={draft.metadata.interviewer ?? ''}
              placeholder="Self-directed"
              onChange={(e) => draft.setMetadataField('interviewer', e.target.value)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px {colors.brand.500}' }}
            />
          </Box>
          <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              Created
            </Text>
            <Text fontSize="sm" fontWeight="500" color="gray.800">
              {new Date(interview.createdAt).toLocaleDateString()}
            </Text>
          </Box>
          <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
            <Text
              fontSize="xs"
              color="gray.500"
              textTransform="uppercase"
              fontWeight="600"
              letterSpacing="0.05em"
            >
              Updated
            </Text>
            <Text fontSize="sm" fontWeight="500" color="gray.800">
              {new Date(interview.updatedAt).toLocaleDateString()}
            </Text>
          </Box>
        </Flex>
        <Box mt={4}>
          <Text
            fontSize="xs"
            color="gray.500"
            textTransform="uppercase"
            fontWeight="600"
            letterSpacing="0.05em"
            mb={1}
          >
            Video URL
          </Text>
          <Input
            size="sm"
            type="url"
            value={draft.metadata.interviewURL ?? ''}
            onChange={(e) => draft.setMetadataField('interviewURL', e.target.value)}
            placeholder="https://youtube.com/..."
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px {colors.brand.500}' }}
          />
        </Box>
      </Box>

      {draft.analysis && (
        <Box>
          <Text
            fontFamily="heading"
            fontSize="lg"
            fontWeight="600"
            color="gray.700"
            mb={3}
            borderBottom="2px solid"
            borderColor="gray.100"
            pb={2}
          >
            LLM Model Config
          </Text>
          <Flex wrap="wrap" gap={4}>
            <Box bg="gray.50" px={3} py={2} borderRadius="md">
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                Model
              </Text>
              <Code fontSize="sm">{draft.analysis.modelConfig.model}</Code>
            </Box>
            <Box bg="gray.50" px={3} py={2} borderRadius="md">
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                Temperature
              </Text>
              <Text fontSize="sm" fontWeight="500">
                {draft.analysis.modelConfig.temperature}
              </Text>
            </Box>
            <Box bg="gray.50" px={3} py={2} borderRadius="md">
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                Max Tokens
              </Text>
              <Text fontSize="sm" fontWeight="500">
                {draft.analysis.modelConfig.maxTokens}
              </Text>
            </Box>
            <Box bg="gray.50" px={3} py={2} borderRadius="md">
              <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">
                Generated
              </Text>
              <Text fontSize="sm" fontWeight="500">
                {new Date(draft.analysis.generatedAt).toLocaleString()}
              </Text>
            </Box>
          </Flex>
        </Box>
      )}
    </Box>
  );

  return (
    <AnalysisEditorTabs
      draft={draft}
      transcript={transcript}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerSlot={header}
      overviewSlot={overview}
      footerSlot={
        <ReviewFooterBar
          isDirty={draft.isDirty}
          saving={saving}
          canApprove={canApprove}
          onSave={handleSave}
          onApprove={handleApprove}
          onReject={() => setRejectModalOpen(true)}
          onDelete={handleDelete}
          onBack={() => router.push('/')}
        />
      }
    />
  );
}
