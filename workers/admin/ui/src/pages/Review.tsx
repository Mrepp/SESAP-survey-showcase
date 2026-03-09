import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  Text,
  Spinner,
  Code,
  Input,
  Textarea,
} from '@chakra-ui/react';
import { isThemeTitle } from '@sesap/shared';
import type { InterviewRecord, Analysis, Demographics, InterviewMetadata } from '@sesap/types';
import { api } from '../api/interviews';
import { StatusBadge } from '../components/StatusBadge';
import { DemographicsEditor } from '../components/DemographicsEditor';
import { TranscriptViewer } from '../components/TranscriptViewer';
import { SummariesEditor } from '../components/SummariesEditor';
import { TimelineEditor } from '../components/TimelineEditor';
import { ThemesEditor } from '../components/ThemesEditor';
import { QuotesEditor } from '../components/QuotesEditor';
import { AreasEditor } from '../components/AreasEditor';
import { AnalysisJsonView } from '../components/AnalysisJsonView';
import { ReviewFooterBar } from '../components/ReviewFooterBar';

type Tab = 'overview' | 'demographics' | 'transcript' | 'summaries' | 'timeline' | 'themes' | 'quotes' | 'areas' | 'json';

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'demographics', label: 'Demographics', icon: '◎' },
  { key: 'transcript', label: 'Transcript', icon: '¶' },
  { key: 'summaries', label: 'Summaries', icon: '≡' },
  { key: 'timeline', label: 'Timeline', icon: '⟶' },
  { key: 'themes', label: 'Themes', icon: '◆' },
  { key: 'quotes', label: 'Quotes', icon: '❝' },
  { key: 'areas', label: 'Improvement', icon: '▲' },
  { key: 'json', label: 'Raw JSON', icon: '{ }' },
];

// Tabs that show the transcript side-by-side for comparison
const sideBySideTabs: Tab[] = ['summaries', 'timeline', 'themes', 'quotes', 'areas'];

const accentMap: Partial<Record<Tab, string>> = {
  summaries: '#3b82f6',
  timeline: '#8b5cf6',
  themes: '#0d9488',
  quotes: '#d97706',
  areas: '#e11d48',
};

export function Review() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [interview, setInterview] = useState<InterviewRecord | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  // Snapshot originals for dirty tracking
  const [originalAnalysis, setOriginalAnalysis] = useState<string>('');
  const [originalDemographics, setOriginalDemographics] = useState<string>('');
  const [originalMetadata, setOriginalMetadata] = useState<string>('');

  const isDirty = useMemo(() => {
    if (!interview) return false;
    const metaDirty = JSON.stringify(interview.metadata) !== originalMetadata;
    const demoDirty = JSON.stringify(interview.demographics) !== originalDemographics;
    const analysisDirty = analysis ? JSON.stringify(analysis) !== originalAnalysis : false;
    return metaDirty || demoDirty || analysisDirty;
  }, [analysis, interview, originalAnalysis, originalDemographics, originalMetadata]);

  const canApprove = interview
    ? interview.processing.status === 'completed' && interview.approval.status === 'pending_review'
    : false;

  // Load data
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    Promise.all([
      api.getInterview(id),
      api.getTranscript(id),
    ])
      .then(async ([rec, txt]) => {
        setInterview(rec);
        setTranscript(txt);
        setOriginalDemographics(JSON.stringify(rec.demographics));
        setOriginalMetadata(JSON.stringify(rec.metadata));

        if (rec.processing.status === 'completed') {
          try {
            const a = await api.getAnalysis(id);
            setAnalysis(a);
            setOriginalAnalysis(JSON.stringify(a));
          } catch {
            // Analysis not ready yet
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  // Unsaved changes warning
  useEffect(() => {
    function handler(e: BeforeUnloadEvent) {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes.';
      }
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

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
    if (!id || !interview) return;

    if (analysis && analysis.themes.some((theme) => !isThemeTitle(theme.title))) {
      setActiveTab('themes');
      showAlert('error', 'One or more theme titles are invalid. Select a canonical theme before saving.');
      return;
    }

    setSaving(true);
    try {
      const demoDirty = JSON.stringify(interview.demographics) !== originalDemographics;
      const metaDirty = JSON.stringify(interview.metadata) !== originalMetadata;
      const analysisDirty = analysis ? JSON.stringify(analysis) !== originalAnalysis : false;

      if (demoDirty) {
        await api.saveDemographics(id, interview.demographics);
      }
      if (metaDirty) {
        await api.saveMetadata(id, interview.metadata);
      }
      if (analysisDirty && analysis) {
        const saved = await api.saveAnalysis(id, analysis);
        setAnalysis(saved);
        setOriginalAnalysis(JSON.stringify(saved));
      }
      setOriginalDemographics(JSON.stringify(interview.demographics));
      setOriginalMetadata(JSON.stringify(interview.metadata));
      const msg = interview.approval.status === 'approved'
        ? 'Corrections saved. Indexes are now out of date \u2014 publish changes from the dashboard.'
        : 'Corrections saved successfully.';
      showAlert('success', msg);
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    if (!id || !confirm('Approve this interview with the current analysis?')) return;
    setSaving(true);
    try {
      const rec = await api.approveInterview(id);
      setInterview(rec);
      showAlert('success', 'Interview approved!');
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Approval failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleReject() {
    if (!id || !rejectReason.trim()) return;
    setSaving(true);
    try {
      const rec = await api.rejectInterview(id, rejectReason.trim());
      setInterview(rec);
      setRejectModalOpen(false);
      setRejectReason('');
      showAlert('success', 'Interview rejected.');
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Rejection failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!id || !confirm('Permanently delete this interview? This cannot be undone.')) return;
    setSaving(true);
    try {
      await api.deleteInterview(id);
      showAlert('success', 'Interview deleted.');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      showAlert('error', err instanceof Error ? err.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  }

  function updateDemographics(d: Demographics) {
    if (interview) {
      setInterview({ ...interview, demographics: d });
    }
  }

  function updateMetadataField(field: keyof InterviewMetadata, value: string) {
    if (interview) {
      setInterview({
        ...interview,
        metadata: { ...interview.metadata, [field]: value },
      });
    }
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
        <Box bg="red.50" color="red.700" p={4} borderRadius="md">{error || 'Interview not found'}</Box>
      </Box>
    );
  }

  return (
    <Flex h="calc(100vh - 64px)" overflow="hidden">
      {/* Sidebar Tabs */}
      <Box
        w="200px"
        bg="sidebar.bg"
        flexShrink={0}
        overflowY="auto"
        py={4}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const accent = accentMap[tab.key];
          const sectionDirty =
            tab.key === 'overview'
              ? JSON.stringify(interview.metadata) !== originalMetadata
              : tab.key === 'demographics'
              ? JSON.stringify(interview.demographics) !== originalDemographics
              : tab.key === 'summaries' && analysis
                ? JSON.stringify(analysis.summaries) !== JSON.stringify(JSON.parse(originalAnalysis || '{}').summaries)
                : tab.key === 'timeline' && analysis
                  ? JSON.stringify(analysis.timeline) !== JSON.stringify(JSON.parse(originalAnalysis || '{}').timeline)
                  : tab.key === 'themes' && analysis
                    ? JSON.stringify(analysis.themes) !== JSON.stringify(JSON.parse(originalAnalysis || '{}').themes)
                    : tab.key === 'quotes' && analysis
                      ? JSON.stringify(analysis.quotes) !== JSON.stringify(JSON.parse(originalAnalysis || '{}').quotes)
                      : tab.key === 'areas' && analysis
                        ? JSON.stringify(analysis.areasForImprovement) !== JSON.stringify(JSON.parse(originalAnalysis || '{}').areasForImprovement)
                        : false;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left' as const,
                cursor: 'pointer',
                borderLeft: `3px solid ${isActive ? (accent ?? '#0d9488') : 'transparent'}`,
                background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: isActive ? '#f8fafc' : '#94a3b8',
                transition: 'all 0.12s',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                border: 'none',
                borderRight: 'none',
                borderTop: 'none',
                borderBottom: 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{ fontSize: '12px', opacity: 0.7, width: '16px', textAlign: 'center' }}>{tab.icon}</span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {sectionDirty && (
                <Box w={2} h={2} borderRadius="full" bg="accent.dirty" flexShrink={0} />
              )}
            </button>
          );
        })}
      </Box>

      {/* Main Content */}
      <Box flex={1} overflowY={sideBySideTabs.includes(activeTab) ? 'hidden' : 'auto'} display="flex" flexDirection="column">
        {/* Alert */}
        {alert && (
          <Box
            px={6}
            pt={4}
          >
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

        {/* Reject Modal */}
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
                <button
                  type="button"
                  onClick={() => setRejectModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    background: '#f3f4f6',
                    border: 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || saving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    fontFamily: 'inherit',
                    opacity: !rejectReason.trim() || saving ? 0.5 : 1,
                  }}
                >
                  {saving ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </Flex>
            </Box>
          </Box>
        )}

        {/* Tab Content */}
        {sideBySideTabs.includes(activeTab) ? (
          /* Side-by-side layout: Transcript | Active Panel */
          <Flex flex={1} overflow="hidden">
            {/* Transcript Panel */}
            <Flex
              w="50%"
              flexShrink={0}
              direction="column"
              overflow="hidden"
              p={5}
              borderRight="1px solid"
              borderColor="gray.200"
            >
              <Text fontFamily="heading" fontSize="sm" fontWeight="600" color="gray.500" mb={3} textTransform="uppercase" letterSpacing="0.05em" flexShrink={0}>
                Source Transcript
              </Text>
              <Box flex={1} minH={0}>
                <TranscriptViewer transcript={transcript} fillHeight />
              </Box>
            </Flex>

            {/* Active Panel Content */}
            <Box w="50%" overflowY="auto" p={5}>
              {activeTab === 'summaries' && analysis && (
                <SummariesEditor
                  summaries={analysis.summaries}
                  onChange={(summaries) => setAnalysis({ ...analysis, summaries })}
                />
              )}

              {activeTab === 'timeline' && analysis && (
                <TimelineEditor
                  timeline={analysis.timeline}
                  onChange={(timeline) => setAnalysis({ ...analysis, timeline })}
                />
              )}

              {activeTab === 'themes' && analysis && (
                <ThemesEditor
                  themes={analysis.themes}
                  onChange={(themes) => setAnalysis({ ...analysis, themes })}
                />
              )}

              {activeTab === 'quotes' && analysis && (
                <QuotesEditor
                  quotes={analysis.quotes}
                  onChange={(quotes) => setAnalysis({ ...analysis, quotes })}
                />
              )}

              {activeTab === 'areas' && analysis && (
                <AreasEditor
                  areas={analysis.areasForImprovement}
                  onChange={(areasForImprovement) => setAnalysis({ ...analysis, areasForImprovement })}
                />
              )}

              {!analysis && (
                <Box bg="blue.50" color="blue.700" p={4} borderRadius="md" fontSize="sm">
                  Analysis data is not available yet. The interview must complete processing first.
                </Box>
              )}
            </Box>
          </Flex>
        ) : (
          /* Single-column layout for non-comparison tabs */
          <Box flex={1} p={6} maxW="1000px">
            {activeTab === 'overview' && (
              <Box>
                <Text fontFamily="heading" fontSize="2xl" fontWeight="700" color="gray.800" mb={4}>
                  {interview.title}
                </Text>

                {/* Status */}
                <Flex gap={3} mb={6}>
                  <StatusBadge status={interview.processing.status} />
                  {(interview.processing.status === 'completed' || interview.processing.status === 'failed') && (
                    <StatusBadge status={interview.approval.status} />
                  )}
                </Flex>

                {interview.processing.error && (
                  <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm" mb={4} border="1px solid" borderColor="red.200">
                    <strong>Processing Error:</strong> {interview.processing.error}
                  </Box>
                )}

                {interview.approval.rejectionReason && (
                  <Box bg="red.50" color="red.700" p={3} borderRadius="md" fontSize="sm" mb={4} border="1px solid" borderColor="red.200">
                    <strong>Rejection Reason:</strong> {interview.approval.rejectionReason}
                  </Box>
                )}

                {/* Interview Metadata */}
                <Box mb={6}>
                  <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700" mb={3} borderBottom="2px solid" borderColor="gray.100" pb={2}>
                    Interview Info
                  </Text>
                  <Flex wrap="wrap" gap={4}>
                    <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em">
                        Interview ID
                      </Text>
                      <Text fontSize="sm" fontWeight="500" color="gray.800">{interview.id}</Text>
                    </Box>
                    <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em" mb={1}>
                        Date
                      </Text>
                      <Input
                        size="sm"
                        type="date"
                        value={interview.metadata.interviewDate}
                        onChange={(e) => updateMetadataField('interviewDate', e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      />
                    </Box>
                    <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em" mb={1}>
                        Interviewer
                      </Text>
                      <Input
                        size="sm"
                        value={interview.metadata.interviewer}
                        onChange={(e) => updateMetadataField('interviewer', e.target.value)}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                      />
                    </Box>
                    <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em">
                        Created
                      </Text>
                      <Text fontSize="sm" fontWeight="500" color="gray.800">{new Date(interview.createdAt).toLocaleDateString()}</Text>
                    </Box>
                    <Box bg="gray.50" px={3} py={2} borderRadius="md" minW="180px">
                      <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em">
                        Updated
                      </Text>
                      <Text fontSize="sm" fontWeight="500" color="gray.800">{new Date(interview.updatedAt).toLocaleDateString()}</Text>
                    </Box>
                  </Flex>
                  <Box mt={4}>
                    <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600" letterSpacing="0.05em" mb={1}>
                      Video URL
                    </Text>
                    <Input
                      size="sm"
                      type="url"
                      value={interview.metadata.interviewURL ?? ''}
                      onChange={(e) => updateMetadataField('interviewURL', e.target.value)}
                      placeholder="https://youtube.com/..."
                      bg="white"
                      border="1px solid"
                      borderColor="gray.200"
                      _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px var(--chakra-colors-brand-500)' }}
                    />
                  </Box>
                </Box>

                {/* Model Config */}
                {analysis && (
                  <Box>
                    <Text fontFamily="heading" fontSize="lg" fontWeight="600" color="gray.700" mb={3} borderBottom="2px solid" borderColor="gray.100" pb={2}>
                      LLM Model Config
                    </Text>
                    <Flex wrap="wrap" gap={4}>
                      <Box bg="gray.50" px={3} py={2} borderRadius="md">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">Model</Text>
                        <Code fontSize="sm">{analysis.modelConfig.model}</Code>
                      </Box>
                      <Box bg="gray.50" px={3} py={2} borderRadius="md">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">Temperature</Text>
                        <Text fontSize="sm" fontWeight="500">{analysis.modelConfig.temperature}</Text>
                      </Box>
                      <Box bg="gray.50" px={3} py={2} borderRadius="md">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">Max Tokens</Text>
                        <Text fontSize="sm" fontWeight="500">{analysis.modelConfig.maxTokens}</Text>
                      </Box>
                      <Box bg="gray.50" px={3} py={2} borderRadius="md">
                        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="600">Generated</Text>
                        <Text fontSize="sm" fontWeight="500">{new Date(analysis.generatedAt).toLocaleString()}</Text>
                      </Box>
                    </Flex>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 'demographics' && (
              <Box>
                <Text fontFamily="heading" fontSize="xl" fontWeight="600" color="gray.700" mb={4}>
                  Demographics
                </Text>
                <DemographicsEditor
                  demographics={interview.demographics}
                  onChange={updateDemographics}
                />
              </Box>
            )}

            {activeTab === 'transcript' && (
              <Box>
                <Text fontFamily="heading" fontSize="xl" fontWeight="600" color="gray.700" mb={4}>
                  Transcript
                </Text>
                <TranscriptViewer transcript={transcript} />
              </Box>
            )}

            {activeTab === 'json' && analysis && (
              <AnalysisJsonView analysis={analysis} />
            )}

            {!analysis && activeTab === 'json' && (
              <Box bg="blue.50" color="blue.700" p={4} borderRadius="md" fontSize="sm">
                Analysis data is not available yet. The interview must complete processing first.
              </Box>
            )}
          </Box>
        )}

        {/* Footer */}
        <ReviewFooterBar
          isDirty={isDirty}
          saving={saving}
          canApprove={canApprove}
          onSave={handleSave}
          onApprove={handleApprove}
          onReject={() => setRejectModalOpen(true)}
          onDelete={handleDelete}
          onBack={() => navigate('/')}
        />
      </Box>
    </Flex>
  );
}
