import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0f1115',
        panel: '#171a21',
        panelSoft: '#1d212a',
        border: '#2a313e',
        textMain: '#e5e7eb',
        textMuted: '#9ca3af',
        accent: '#3b82f6'
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Segoe UI"', 'sans-serif']
      }
    }
  },
  plugins: []
};

export default config;
