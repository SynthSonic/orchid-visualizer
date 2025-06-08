import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
        instrument: ['var(--font-instrument)', ...fontFamily.serif],
      },
      letterSpacing: {
        tighter: '-0.03em', // -3% letter spacing
      },
      fontSize: {
        '12px': '12px',
        '14px': '14px',
        '16px': '16px',
        '17px': '17px',
        '44px': '44px',
      },
    },
  },
  plugins: [
    function({ addUtilities }: { addUtilities: (utilities: Record<string, Record<string, string>>) => void }) {
      const newUtilities = {
        // Body text styles
        '.text-body-1': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '16px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
        },
        '.text-body-1-emphasized': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '16px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
        '.text-body-2': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '14px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
        },
        '.text-body-2-emphasized': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '14px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
        // Headings and titles
        '.text-heading-1': {
          fontFamily: 'var(--font-instrument)',
          fontSize: '32px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
        },
        '.text-title-1': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '20px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
        // Keyboard styles
        '.text-keyboard-h1': {
          fontFamily: 'var(--font-instrument)',
          fontSize: '44px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
        },
        '.text-keyboard-label': {
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '16px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
        // Navigation and footer
        '.text-navigation': {
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '17px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
        '.text-footer-body': {
          fontFamily: 'var(--font-geist-sans)',
          fontSize: '14px',
          fontWeight: '400',
          letterSpacing: '-0.03em',
        },
        '.text-footer-button': {
          fontFamily: 'var(--font-geist-mono)',
          fontSize: '12px',
          fontWeight: '500',
          letterSpacing: '-0.03em',
        },
      };
      addUtilities(newUtilities);
    },
  ],
} satisfies Config;
