/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#f8fafc',
          dim: '#f1f5f9',
          bright: '#ffffff',
          container: {
            DEFAULT: '#ffffff',
            low: '#f8fafc',
            high: '#f1f5f9',
            highest: '#e2e8f0',
            lowest: '#ffffff',
          },
        },
        outline: {
          DEFAULT: '#94a3b8',
          variant: '#cbd5e1',
        },
        brand: {
          primary: '#0ea5e9',
          secondary: '#6366f1',
          accent: '#f43f5e',
          success: '#10b981',
          warning: '#f59e0b',
          info: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-metrics': ['48px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'label-bold': ['12px', { lineHeight: '1', letterSpacing: '0.05em', fontWeight: '700' }],
      },
      spacing: {
        gutter: '24px',
        margin: '32px',
      },
    },
  },
  plugins: [],
};
