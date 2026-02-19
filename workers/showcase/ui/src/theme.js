import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react';

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        heading: { value: "'Roboto', system-ui, sans-serif" },
        body: { value: "'Roboto', system-ui, sans-serif" },
      },
      colors: {
        brand: {
          50: { value: '#dbeafe' },
          100: { value: '#bfdbfe' },
          200: { value: '#93c5fd' },
          300: { value: '#60a5fa' },
          400: { value: '#3b82f6' },
          500: { value: '#2563eb' },
          600: { value: '#1d4ed8' },
          700: { value: '#1e3a5f' },
          800: { value: '#1e40af' },
          900: { value: '#1e3a8a' },
          950: { value: '#172554' },
        },
        accent: {
          50: { value: '#d1fae5' },
          100: { value: '#a7f3d0' },
          200: { value: '#6ee7b7' },
          300: { value: '#34d399' },
          400: { value: '#10b981' },
          500: { value: '#059669' },
          600: { value: '#047857' },
          700: { value: '#064e3b' },
          800: { value: '#065f46' },
          900: { value: '#064e3b' },
          950: { value: '#022c22' },
        },
        score: {
          high: { value: '#059669' },
          highBg: { value: '#d1fae5' },
          med: { value: '#d97706' },
          medBg: { value: '#fef3c7' },
          low: { value: '#dc2626' },
          lowBg: { value: '#fef2f2' },
        },
        surface: {
          bg: { value: '#f8f9fa' },
          card: { value: '#ffffff' },
          hover: { value: '#f0f2f5' },
          border: { value: '#dee2e6' },
        },
      },
    },
  },
});

export const system = createSystem(defaultConfig, config);
