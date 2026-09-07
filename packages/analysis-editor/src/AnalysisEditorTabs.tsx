'use client';

import type { ReactNode } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';
import { AnalysisJsonView } from './components/AnalysisJsonView';
import { AreasEditor } from './components/AreasEditor';
import { DemographicsEditor } from './components/DemographicsEditor';
import { IdentitiesEditor } from './components/IdentitiesEditor';
import { QuotesEditor } from './components/QuotesEditor';
import { SummariesEditor } from './components/SummariesEditor';
import { ThemesEditor } from './components/ThemesEditor';
import { TimelineEditor } from './components/TimelineEditor';
import { TranscriptViewer } from './components/TranscriptViewer';
import {
  DEFAULT_TAB_ACCENT,
  EDITOR_TABS,
  SIDE_BY_SIDE_TABS,
  TAB_ACCENTS,
  type EditorTab,
  type EditorTabSpec,
} from './tabs';
import type { AnalysisDraft } from './useAnalysisDraft';

export interface AnalysisEditorTabsProps {
  draft: AnalysisDraft;
  transcript: string;
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  /** Which tabs to show, in order. Defaults to all of them. */
  tabs?: EditorTabSpec[];
  /** Rendered above the tab content — alerts, modals, banners. */
  headerSlot?: ReactNode;
  /** Rendered inside the Overview tab, beneath the title field. */
  overviewSlot?: ReactNode;
  /** Rendered below the tab content — typically a `ReviewFooterBar`. */
  footerSlot?: ReactNode;
}

const NO_ANALYSIS_NOTE = (
  <Box bg="blue.50" color="blue.700" p={4} borderRadius="md" fontSize="sm">
    Analysis data is not available yet. The interview must complete processing first.
  </Box>
);

/**
 * The tabbed editor shell: sidebar rail, side-by-side/single-column switch and
 * editor dispatch. All interview state lives in `draft`; everything
 * app-specific arrives through the three slots.
 */
export function AnalysisEditorTabs({
  draft,
  transcript,
  activeTab,
  onTabChange,
  tabs = EDITOR_TABS,
  headerSlot,
  overviewSlot,
  footerSlot,
}: AnalysisEditorTabsProps) {
  const { analysis, setAnalysis } = draft;
  const sideBySide = SIDE_BY_SIDE_TABS.includes(activeTab);

  return (
    <Flex h="calc(100vh - 64px)" overflow="hidden">
      <Box w="200px" bg="sidebar.bg" flexShrink={0} overflowY="auto" py={4}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const accent = TAB_ACCENTS[tab.key];

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 16px',
                textAlign: 'left' as const,
                cursor: 'pointer',
                borderLeft: `3px solid ${isActive ? (accent ?? DEFAULT_TAB_ACCENT) : 'transparent'}`,
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
              <span style={{ fontSize: '12px', opacity: 0.7, width: '16px', textAlign: 'center' }}>
                {tab.icon}
              </span>
              <span style={{ flex: 1 }}>{tab.label}</span>
              {draft.isTabDirty(tab.key) && (
                <Box w={2} h={2} borderRadius="full" bg="accent.dirty" flexShrink={0} />
              )}
            </button>
          );
        })}
      </Box>

      <Box
        flex={1}
        overflowY={sideBySide ? 'hidden' : 'auto'}
        display="flex"
        flexDirection="column"
      >
        {headerSlot}

        {sideBySide ? (
          <Flex flex={1} overflow="hidden">
            <Flex
              w="50%"
              flexShrink={0}
              direction="column"
              overflow="hidden"
              p={5}
              borderRight="1px solid"
              borderColor="gray.200"
            >
              <Text
                fontFamily="heading"
                fontSize="sm"
                fontWeight="600"
                color="gray.500"
                mb={3}
                textTransform="uppercase"
                letterSpacing="0.05em"
                flexShrink={0}
              >
                Source Transcript
              </Text>
              <Box flex={1} minH={0}>
                <TranscriptViewer transcript={transcript} fillHeight />
              </Box>
            </Flex>

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
                  quotes={analysis.quotes}
                  onQuotesChange={(quotes) => setAnalysis({ ...analysis, quotes })}
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
                  onChange={(areasForImprovement) =>
                    setAnalysis({ ...analysis, areasForImprovement })
                  }
                />
              )}

              {activeTab === 'identities' && analysis && (
                <IdentitiesEditor
                  identities={analysis.identities ?? []}
                  onChange={(identities) => setAnalysis({ ...analysis, identities })}
                />
              )}

              {!analysis && NO_ANALYSIS_NOTE}
            </Box>
          </Flex>
        ) : (
          <Box flex={1} p={6} maxW="1000px">
            {activeTab === 'overview' && overviewSlot}

            {activeTab === 'demographics' && (
              <Box>
                <Text fontFamily="heading" fontSize="xl" fontWeight="600" color="gray.700" mb={1}>
                  Demographics
                </Text>
                <Text fontSize="xs" color="gray.500" mb={4}>
                  Auto-detected from the transcript. Review and edit as needed — your edits are
                  preserved on reprocess.
                </Text>
                <DemographicsEditor
                  demographics={draft.demographics}
                  onChange={draft.setDemographics}
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

            {activeTab === 'json' && (analysis ? <AnalysisJsonView analysis={analysis} /> : NO_ANALYSIS_NOTE)}
          </Box>
        )}

        {footerSlot}
      </Box>
    </Flex>
  );
}
