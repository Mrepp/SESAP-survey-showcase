import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';
import type { SystemConfig, SystemContext } from '@chakra-ui/react';
import { ACCENT_SCALE, BRAND_SCALE, OSU_COLORS, SURFACE_SCALE } from './tokens';

type ColorToken = { value: string };

function asTokens<T extends Record<string, string>>(scale: T): Record<keyof T, ColorToken> {
  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [key, { value }]),
  ) as Record<keyof T, ColorToken>;
}

/**
 * The SESAP design system: the OSU brand tokens, plus the semantic scales the
 * app UIs address by name. Kept as one config so admin, intake and the public
 * showcase cannot drift apart.
 */
export const sesapConfig: SystemConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        ...asTokens(OSU_COLORS),
        brand: asTokens(BRAND_SCALE),
        surface: asTokens(SURFACE_SCALE),
        accent: asTokens(ACCENT_SCALE),
      },
    },
  },
  globalCss: {
    'h1, h2, h3, h4, h5, h6': {
      color: 'beavOrange',
      marginTop: '15px',
      marginBottom: '15px',
    },
    body: {
      color: 'osuGray',
    },
  },
});

/**
 * Build the Chakra system for an app. Pass `overrides` for app-local scales —
 * the admin sidebar, for instance — rather than redefining brand colors.
 */
export function createSesapSystem(...overrides: SystemConfig[]): SystemContext {
  return createSystem(defaultConfig, sesapConfig, ...overrides);
}
