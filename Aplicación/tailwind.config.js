/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#141218',
          dim: '#141218',
          bright: '#3b383e',
          container: {
            DEFAULT: '#211f24',
            low: '#1d1b20',
            high: '#2b292f',
            highest: '#36343a',
            lowest: '#0f0d13',
          },
        },
        outline: {
          DEFAULT: '#948e9c',
          variant: '#494551',
        },
        neon: {
          orange: '#fb923c',
          cyan: '#22d3ee',
          emerald: '#34d399',
          purple: '#a855f7',
          skyblue: '#38bdf8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
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
