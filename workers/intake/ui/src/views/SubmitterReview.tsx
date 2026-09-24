'use client';

import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Input, Spinner, Text } from '@chakra-ui/react';
import type { InterviewDraft } from '@sesap/types';
import {
  AnalysisEditorTabs,
  EDITOR_TABS,
  InvalidThemeTitleError,
  ReviewFooterBar,
  useAnalysisDraft,
  type AnalysisDraftInitial,
  type EditorTab,
} from '@sesap/analysis-editor';
import { api, type SubmitterView as SubmitterViewData } from '../lib/api';

/**
 * The submitter edits the same slices an admin does, minus the machinery that
 * only makes sense to staff: no raw JSON, no reprocess, no accept-stamp, and no
 * approve/reject/delete.
 */
const SUBMITTER_TABS = EDITOR_TABS.filter((tab) => tab.key !== 'json');

/**
 * The token lives in the path (`/review/<token>`), not a query string, and the
 * worker rewrites every such path to this one static page.
 */
function tokenFromLocation(): string {
  const match = window.location.pathname.match(/\/review\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export function SubmitterReview() {
  const [token, setToken] = useState('');
  const [view, setView] = useState<SubmitterViewData | null>(null);
  const [initial, setInitial] = useState<AnalysisDraftInitial | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSave = useCallback(
    async (draft: InterviewDraft) => {
      const { analysis } = await api.saveReviewDraft(token, draft);
      return { analysis };
    },
    [token],
  );

  const draft = useAnalysisDraft({ initial, onSave });

  useEffect(() => {
    const found = tokenFromLocation();
    setToken(found);

    if (!found) {
      setError('This review link is missing its token.');
      setLoading(false);
      return;
    }

    api
      .getReview(found)
      .then((data) => {
        setView(data);
        setInitial({
          title: data.title,
          demographics: data.demographics,
          metadata: data.metadata,
          analysis: data.analysis,
        });
        setSubmitted(data.approvalStatus === 'pending_review');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load your interview.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  async function handleSave() {
    try {
      await draft.save();
      setAlert({ type: 'success', message: 'Saved. You can keep editing.' });
    } catch (err) {
      if (err instanceof InvalidThemeTitleError) setActiveTab('themes');
      setAlert({ type: 'error', message: err instanceof Error ? err.message : 'Save failed' });
    }
  }

  async function handleSubmit() {
    if (
      !confirm(
        'Send your edits to the SESAP team? You will not be able to edit again unless the team requests a change.',
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      if (draft.isDirty) await draft.save();
      await api.submitReview(token);
      setSubmitted(true);
    } catch (err) {
      setAlert({ type: 'error', message: err instanceof Error ? err.message : 'Submit failed' });
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" py={20}>
        <Spinner size="xl" color="brand.500" />
      </Flex>
    );
  }

  if (error || !view) {
    return (
      <Box maxW="640px" mx="auto" p={8}>
        <Heading size="md" mb={3}>
          We could not open this link
        </Heading>
        <Box bg="red.50" color="red.700" p={4} borderRadius="md" fontSize="sm">
          {error || 'This review link is no longer valid.'}
        </Box>
      </Box>
    );
  }

  if (submitted) {
    return (
      <Box maxW="640px" mx="auto" p={8}>
        <Heading size="md" mb={3}>
          Thank you — it is with the program now
        </Heading>
        <Text fontSize="sm" color="osuGray">
          The SESAP team will review your edits before deciding whether to
          publish your interview on the SESAP site. If a change is needed, we
          will email you a new link.
        </Text>
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
          >
            {alert.message}
          </Box>
        </Box>
      )}
      {view.rejectionReason && (
        <Box px={6} pt={4}>
          <Box bg="yellow.50" color="yellow.900" p={3} borderRadius="md" fontSize="sm">
            <strong>A change was requested:</strong> {view.rejectionReason}
          </Box>
        </Box>
      )}
    </>
  );

  const overview = (
    <Box>
      <Input
        value={draft.title}
        onChange={(event) => draft.setTitle(event.target.value)}
        fontSize="2xl"
        fontWeight="700"
        mb={4}
        bg="transparent"
        border="1px solid transparent"
        borderRadius="md"
        px={2}
        _hover={{ borderColor: 'gray.200' }}
        _focus={{ borderColor: 'brand.500', bg: 'white' }}
        aria-label="Interview title"
      />
      <Text fontSize="sm" color="osuGray" mb={6}>
        This is a draft description and analysis of your recording. Correct
        anything it got wrong, such as a theme, quote, or date. The transcript
        is shown for reference; changes to it need help from the SESAP team.
        When the draft is ready, send your edits to the team.
      </Text>
      <Box bg="surface.input" p={4} borderRadius="md" fontSize="sm">
        <Text fontWeight="600" mb={1}>
          What happens next
        </Text>
        <Text color="osuGray">
          Once you send your edits, the SESAP team reviews them. The interview
          can appear on the public SESAP site after the team approves it and
          publishes an updated site index.
        </Text>
      </Box>
    </Box>
  );

  return (
    <AnalysisEditorTabs
      draft={draft}
      transcript={view.transcript}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      tabs={SUBMITTER_TABS}
      headerSlot={header}
      overviewSlot={overview}
      footerSlot={
        <ReviewFooterBar
          isDirty={draft.isDirty}
          saving={draft.saving || busy}
          onSave={handleSave}
          onBack={() => window.location.assign('/')}
          backLabel="Home"
          extraActions={
            <Button colorPalette="green" size="sm" disabled={busy} onClick={handleSubmit}>
              Send edits to SESAP
            </Button>
          }
        />
      }
    />
  );
}
