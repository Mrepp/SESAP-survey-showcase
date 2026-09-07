'use client';

import { ChakraProvider, defineConfig } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';
import { createSesapSystem } from '@sesap/design-system';

/**
 * Admin-only scale. The brand, surface and accent scales come from
 * `@sesap/design-system`; only the dark navigation rail is local to admin.
 */
const adminConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        sidebar: {
          bg: { value: '#0f172a' },
          hover: { value: '#1e293b' },
          active: { value: '#334155' },
          text: { value: '#94a3b8' },
          textActive: { value: '#f8fafc' },
        },
      },
    },
  },
});

const system = createSesapSystem(adminConfig);

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider value={system}>
      <ThemeProvider attribute="class" disableTransitionOnChange>
        {children}
      </ThemeProvider>
    </ChakraProvider>
  );
}
