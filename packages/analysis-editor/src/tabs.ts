import { ACCENT_SCALE } from '@sesap/design-system';

export type EditorTab =
  | 'overview'
  | 'demographics'
  | 'transcript'
  | 'summaries'
  | 'timeline'
  | 'themes'
  | 'quotes'
  | 'areas'
  | 'identities'
  | 'json';

export interface EditorTabSpec {
  key: EditorTab;
  label: string;
  icon: string;
}

export const EDITOR_TABS: EditorTabSpec[] = [
  { key: 'overview', label: 'Overview', icon: '◉' },
  { key: 'demographics', label: 'Demographics', icon: '◎' },
  { key: 'transcript', label: 'Transcript', icon: '¶' },
  { key: 'summaries', label: 'Summaries', icon: '≡' },
  { key: 'timeline', label: 'Timeline', icon: '⟶' },
  { key: 'themes', label: 'Themes', icon: '◆' },
  { key: 'quotes', label: 'Quotes', icon: '❝' },
  { key: 'areas', label: 'Improvement', icon: '▲' },
  { key: 'identities', label: 'Identities', icon: '◈' },
  { key: 'json', label: 'Raw JSON', icon: '{ }' },
];

/** Tabs that show the transcript beside the panel being edited. */
export const SIDE_BY_SIDE_TABS: EditorTab[] = [
  'summaries',
  'timeline',
  'themes',
  'quotes',
  'areas',
  'identities',
];

/** Functional category coding for the sidebar rail — see `ACCENT_SCALE`. */
export const TAB_ACCENTS: Partial<Record<EditorTab, string>> = {
  summaries: ACCENT_SCALE.summary,
  timeline: ACCENT_SCALE.timeline,
  themes: ACCENT_SCALE.theme,
  quotes: ACCENT_SCALE.quote,
  areas: ACCENT_SCALE.area,
  identities: ACCENT_SCALE.theme,
};

export const DEFAULT_TAB_ACCENT = ACCENT_SCALE.theme;
