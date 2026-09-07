'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isThemeTitle } from '@sesap/core';
import type { Analysis, Demographics, InterviewDraft, InterviewMetadata } from '@sesap/types';
import { backfillTimeline } from './lib/timelineInference';
import type { EditorTab } from './tabs';

export interface AnalysisDraftInitial {
  title: string;
  demographics: Demographics;
  metadata: InterviewMetadata;
  /** `null` while the interview is still processing. */
  analysis: Analysis | null;
}

export interface AnalysisDraftSaveResult {
  /** The analysis as the server stored it, so ids assigned server-side stick. */
  analysis?: Analysis;
}

export interface UseAnalysisDraftOptions {
  /** Loaded values; pass `null` until they arrive. */
  initial: AnalysisDraftInitial | null;
  /** Persists the draft. Reject to surface an error; the draft stays dirty. */
  onSave: (draft: InterviewDraft) => Promise<AnalysisDraftSaveResult | void>;
}

/**
 * Per-slice snapshots of the loaded values. Comparing against these strings is
 * what drives the dirty indicators; they are recomputed only when a save lands
 * or new initial values arrive, never on render.
 */
interface Snapshots {
  title: string;
  demographics: string;
  metadata: string;
  summaries: string;
  timeline: string;
  themes: string;
  quotes: string;
  areas: string;
  identities: string;
}

const EMPTY_SNAPSHOTS: Snapshots = {
  title: '',
  demographics: '',
  metadata: '',
  summaries: '',
  timeline: '',
  themes: '',
  quotes: '',
  areas: '',
  identities: '',
};

function snapshot(initial: AnalysisDraftInitial): Snapshots {
  const analysis = initial.analysis;
  return {
    title: initial.title,
    demographics: JSON.stringify(initial.demographics),
    metadata: JSON.stringify(initial.metadata),
    summaries: JSON.stringify(analysis?.summaries ?? []),
    timeline: JSON.stringify(analysis?.timeline ?? []),
    themes: JSON.stringify(analysis?.themes ?? []),
    quotes: JSON.stringify(analysis?.quotes ?? []),
    areas: JSON.stringify(analysis?.areasForImprovement ?? []),
    identities: JSON.stringify(analysis?.identities ?? []),
  };
}

export class InvalidThemeTitleError extends Error {
  constructor() {
    super('One or more theme titles are invalid. Select a canonical theme before saving.');
    this.name = 'InvalidThemeTitleError';
  }
}

export interface AnalysisDraft {
  title: string;
  setTitle: (title: string) => void;
  demographics: Demographics;
  setDemographics: (demographics: Demographics) => void;
  metadata: InterviewMetadata;
  setMetadataField: (field: keyof InterviewMetadata, value: string) => void;
  analysis: Analysis | null;
  setAnalysis: (analysis: Analysis) => void;

  isDirty: boolean;
  isTabDirty: (tab: EditorTab) => boolean;
  saving: boolean;

  /**
   * Validate and persist. Throws {@link InvalidThemeTitleError} before touching
   * the network if any theme title is off-list.
   */
  save: () => Promise<void>;
}

/**
 * Headless state for the interview editor: it owns the draft, tracks which
 * slices differ from what was loaded, guards against navigating away with
 * unsaved work, and hands the whole thing to one `onSave`. It fetches nothing,
 * which is what lets both the admin and submitter editors share it.
 */
export function useAnalysisDraft({ initial, onSave }: UseAnalysisDraftOptions): AnalysisDraft {
  const [title, setTitle] = useState('');
  const [demographics, setDemographics] = useState<Demographics>({});
  const [metadata, setMetadata] = useState<InterviewMetadata>({ interviewDate: '' });
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshots>(EMPTY_SNAPSHOTS);
  const [saving, setSaving] = useState(false);

  // Seed from `initial` exactly once per distinct object identity.
  const seededFrom = useRef<AnalysisDraftInitial | null>(null);
  useEffect(() => {
    if (!initial || seededFrom.current === initial) return;
    seededFrom.current = initial;

    // Legacy timeline points carry no `term`/`position`; infer them from the
    // existing period/event text so the editor shows sensible defaults rather
    // than "Pre College" for everything. Inferring into the snapshot too means
    // merely opening the page does not read as dirty — saving still persists.
    const seeded = initial.analysis
      ? { ...initial.analysis, timeline: backfillTimeline(initial.analysis.timeline).timeline }
      : null;
    const seededInitial: AnalysisDraftInitial = { ...initial, analysis: seeded };

    setTitle(seededInitial.title);
    setDemographics(seededInitial.demographics);
    setMetadata(seededInitial.metadata);
    setAnalysis(seeded);
    setSnapshots(snapshot(seededInitial));
  }, [initial]);

  const current = useMemo<Snapshots>(
    () =>
      snapshot({
        title,
        demographics,
        metadata,
        analysis,
      }),
    [title, demographics, metadata, analysis],
  );

  const isDirty = useMemo(
    () => (Object.keys(current) as (keyof Snapshots)[]).some((key) => current[key] !== snapshots[key]),
    [current, snapshots],
  );

  const isTabDirty = useCallback(
    (tab: EditorTab): boolean => {
      switch (tab) {
        case 'overview':
          return current.title !== snapshots.title || current.metadata !== snapshots.metadata;
        case 'demographics':
          return current.demographics !== snapshots.demographics;
        case 'summaries':
          return current.summaries !== snapshots.summaries;
        case 'timeline':
          return current.timeline !== snapshots.timeline;
        case 'themes':
          return current.themes !== snapshots.themes;
        case 'quotes':
          return current.quotes !== snapshots.quotes;
        case 'areas':
          return current.areas !== snapshots.areas;
        case 'identities':
          return current.identities !== snapshots.identities;
        default:
          return false;
      }
    },
    [current, snapshots],
  );

  // Unsaved-changes guard.
  useEffect(() => {
    function handler(event: BeforeUnloadEvent) {
      if (isDirty) {
        event.preventDefault();
        event.returnValue = 'You have unsaved changes.';
      }
    }
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const setMetadataField = useCallback((field: keyof InterviewMetadata, value: string) => {
    setMetadata((previous) => ({ ...previous, [field]: value }));
  }, []);

  const save = useCallback(async () => {
    if (analysis && analysis.themes.some((theme) => !isThemeTitle(theme.title))) {
      throw new InvalidThemeTitleError();
    }

    // Send only what changed; the endpoint leaves absent slices alone.
    const draft: InterviewDraft = {};
    if (current.title !== snapshots.title) draft.title = title;
    if (current.demographics !== snapshots.demographics) draft.demographics = demographics;
    if (current.metadata !== snapshots.metadata) draft.metadata = metadata;
    const analysisDirty = (
      ['summaries', 'timeline', 'themes', 'quotes', 'areas', 'identities'] as const
    ).some((key) => current[key] !== snapshots[key]);
    if (analysisDirty && analysis) draft.analysis = analysis;

    if (Object.keys(draft).length === 0) return;

    setSaving(true);
    try {
      const result = await onSave(draft);
      const savedAnalysis = result?.analysis ?? analysis;
      if (savedAnalysis) setAnalysis(savedAnalysis);
      setSnapshots(
        snapshot({ title, demographics, metadata, analysis: savedAnalysis ?? null }),
      );
    } finally {
      setSaving(false);
    }
  }, [analysis, current, demographics, metadata, onSave, snapshots, title]);

  return {
    title,
    setTitle,
    demographics,
    setDemographics,
    metadata,
    setMetadataField,
    analysis,
    setAnalysis,
    isDirty,
    isTabDirty,
    saving,
    save,
  };
}
