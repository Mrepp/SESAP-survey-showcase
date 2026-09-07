/**
 * OSU brand palette. These five are the canonical values, sourced from the
 * university brand guide — everything else in this package is derived from
 * them rather than introduced alongside them.
 *
 * @see https://communications.oregonstate.edu/brand-guide/colors
 */
export const OSU_COLORS = {
  osuOffWhite: '#f7f5f5',
  osuOffBlack: '#212529',
  osuGray: '#423e3c',
  osuNavGray: '#e9e5e4',
  beavOrange: '#D73F09',
} as const;

/**
 * `brand` ramp derived from Beaver Orange: 50–400 are tints toward white, 500
 * is the brand color itself, 600–950 are shades toward OSU off-black. No new
 * hues are introduced.
 */
export const BRAND_SCALE = {
  50: '#fdf5f3',
  100: '#fae8e2',
  200: '#f5cfc2',
  300: '#eeae98',
  400: '#e47c58',
  500: OSU_COLORS.beavOrange,
  600: '#bc3b0e',
  700: '#a03713',
  800: '#853317',
  900: '#6a2f1c',
  950: '#492b22',
} as const;

/** Semantic surfaces, expressed in terms of the OSU tokens. */
export const SURFACE_SCALE = {
  page: OSU_COLORS.osuOffWhite,
  card: '#ffffff',
  input: OSU_COLORS.osuNavGray,
} as const;

/**
 * Functional category coding for the analysis editor's tabs — this is not
 * brand, it is a legend, so these stay their own hues.
 */
export const ACCENT_SCALE = {
  summary: '#3b82f6',
  timeline: '#8b5cf6',
  theme: '#0d9488',
  quote: '#d97706',
  area: '#e11d48',
  /** Unsaved-changes indicator. */
  dirty: '#d97706',
} as const;
