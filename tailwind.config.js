const { join } = require('path');
const { heroui } = require('@heroui/react');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(__dirname, 'src/**/*.{ts,tsx,js,jsx}'),
    join(__dirname, 'pages/**/*.{ts,tsx,js,jsx}'),
    join(__dirname, 'components/**/*.{ts,tsx,js,jsx}'),
    join(__dirname, 'app/**/*.{ts,tsx,js,jsx}'),
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      /* Inter runs heavier than Outfit: keep 600 as the strongest weight in the UI. */
      fontWeight: {
        bold: '600',
        extrabold: '600',
        black: '600',
      },
      /*
       * Inter reads larger than Outfit at the same size: 15px body (as the hub) and slightly
       * tighter display sizes. Letter-spacing follows Inter's recommended tracking per size.
       */
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.125rem' }],
        sm: ['0.875rem', { lineHeight: '1.3125rem', letterSpacing: '-0.006em' }],
        base: ['0.9375rem', { lineHeight: '1.5rem', letterSpacing: '-0.009em' }],
        lg: ['1.0625rem', { lineHeight: '1.625rem', letterSpacing: '-0.012em' }],
        xl: ['1.1875rem', { lineHeight: '1.75rem', letterSpacing: '-0.014em' }],
        '2xl': ['1.375rem', { lineHeight: '1.875rem', letterSpacing: '-0.018em' }],
        '3xl': ['1.75rem', { lineHeight: '2.25rem', letterSpacing: '-0.021em' }],
        '4xl': ['2.125rem', { lineHeight: '2.5rem', letterSpacing: '-0.022em' }],
      },
      /* Same scale as instanvi-payroll-expense-fe: every step derives from --radius (0.25rem). */
      borderRadius: {
        sm: 'calc(var(--radius) * 0.6)',
        DEFAULT: 'calc(var(--radius) * 0.8)',
        md: 'calc(var(--radius) * 0.8)',
        lg: 'var(--radius)',
        xl: 'calc(var(--radius) * 1.4)',
        '2xl': 'calc(var(--radius) * 1.8)',
        '3xl': 'calc(var(--radius) * 2.2)',
      },
      /* Palette ported from instanvi-payroll-expense-fe (app/globals.css). */
      colors: {
        brand: {
          DEFAULT: 'var(--brand)',
          hover: 'var(--brand-hover)',
          light: 'var(--brand-light)',
          'light-foreground': 'var(--brand-light-foreground)',
          subtle: 'var(--brand-subtle)',
        },
        'main-bg': 'var(--main-bg)',
        'table-head': 'var(--brand-subtle)',
        primary: {
          DEFAULT: '#0B5D1E',
          foreground: '#FFFFFF',
          50: '#F1FAF7',
          100: '#DCF0E1',
          200: '#B5DFC0',
          300: '#82C796',
          400: '#4BA866',
          500: '#1E7F3A',
          600: '#0B5D1E',
          700: '#094C18',
          800: '#073A12',
          900: '#05290D',
        },
        secondary: {
          DEFAULT: '#A3E46B',
          foreground: '#0B3D12',
          50: '#F3FCE9',
          100: '#E6F9D3',
          200: '#D0F4AE',
          300: '#B8EF89',
          400: '#A3E46B',
          500: '#89D353',
          600: '#6EBD38',
          700: '#548F2B',
          800: '#3A621E',
          900: '#213611',
        },
        warning: {
          DEFAULT: '#F08A24',
          foreground: '#000000',
          50: '#FFF8E6',
          100: '#FFEFC0',
          200: '#FFE599',
          300: '#FFDB73',
          400: '#FFC940',
          500: '#FFB800',
          600: '#CC9300',
          700: '#996E00',
          800: '#664A00',
          900: '#332500',
        },
        destructive: {
          DEFAULT: '#E5181B',
          foreground: '#FFFFFF',
          50: '#FFF0F0',
          100: '#FFDBDB',
          200: '#FFC2C2',
          300: '#FFA8A8',
          400: '#FF5C5C',
          500: '#FF2E2E',
          600: '#FF0000',
          700: '#CC0000',
          800: '#990000',
          900: '#660000',
        },
        success: {
          DEFAULT: '#2E7D32',
          foreground: '#FFFFFF',
          50: '#E6F9E6',
          100: '#C1F0C1',
          200: '#9DE69D',
          300: '#78DC78',
          400: '#3CCC3C',
          500: '#00B800',
          600: '#009300',
          700: '#006E00',
          800: '#004A00',
          900: '#002500',
        },
        info: {
          DEFAULT: '#2563EB',
          foreground: '#FFFFFF',
          50: '#E6F5FF',
          100: '#CCE9FF',
          200: '#99D3FF',
          300: '#66BDFF',
          400: '#33A7FF',
          500: '#00A3FF',
          600: '#0082CC',
          700: '#006299',
          800: '#004166',
          900: '#002033',
        },
        accent: {
          DEFAULT: 'rgb(0 0 0 / 0.04)',
          foreground: '#111111',
        },
        muted: {
          DEFAULT: 'rgb(0 0 0 / 0.04)',
          foreground: 'rgb(0 0 0 / 0.55)',
        },
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        popover: {
          DEFAULT: '#FFFFFF',
          foreground: '#111111',
        },
        border: 'rgb(0 0 0 / 0.1)',
        input: 'rgb(0 0 0 / 0.12)',
        ring: '#0B5D1E',
        background: '#FFFFFF',
        foreground: '#111111',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      layout: { radius: { small: '2px', medium: '3px', large: '4px' } },
    }),
  ],
};
