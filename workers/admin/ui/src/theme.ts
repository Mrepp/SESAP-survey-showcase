import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: `'Roboto', system-ui, sans-serif` },
        body: { value: `'Roboto', system-ui, sans-serif` },
      },
      colors: {
        brand: {
          50: { value: '#f0fdfa' },
          100: { value: '#ccfbf1' },
          200: { value: '#99f6e4' },
          300: { value: '#5eead4' },
          400: { value: '#2dd4bf' },
          500: { value: '#0d9488' },
          600: { value: '#0f766e' },
          700: { value: '#115e59' },
          800: { value: '#134e4a' },
          900: { value: '#0f172a' },
          950: { value: '#0a0f1a' },
        },
        sidebar: {
          bg: { value: '#0f172a' },
          hover: { value: '#1e293b' },
          active: { value: '#334155' },
          text: { value: '#94a3b8' },
          textActive: { value: '#f8fafc' },
        },
        surface: {
          page: { value: '#fafaf8' },
          card: { value: '#ffffff' },
          input: { value: '#f1f5f9' },
        },
        accent: {
          summary: { value: '#3b82f6' },
          timeline: { value: '#8b5cf6' },
          theme: { value: '#0d9488' },
          quote: { value: '#d97706' },
          area: { value: '#e11d48' },
          dirty: { value: '#d97706' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
