/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /*
         * Cream and charcoal are shared verbatim with Atronz Pet Health — the
         * canvas, type colour and hairlines are the brand and must match.
         * What separates the two products is the accent: Pet Health leads with
         * sage, Pet Social leads with clay.
         */
        cream: {
          50: '#FDFCFA',
          100: '#FAF8F4',
          200: '#F4F1EA',
          300: '#EBE7DE',
        },
        clay: {
          50: '#FBF3EF',
          100: '#F6E6DE',
          200: '#EDCDBE',
          300: '#DFAE97',
          400: '#D19478',
          /* 500 is the brand clay. It only clears 2.6:1 on cream, so it is for
             fills and decoration; 700 carries text and solid buttons (5.9:1
             on cream, 6.2:1 against white text). */
          500: '#C2836A',
          600: '#A96A51',
          700: '#8A5340',
          800: '#6E4334',
          900: '#573629',
        },
        /* Kept for positive/verified states so both apps speak one language. */
        sage: {
          50: '#F2F6F3',
          100: '#E3EBE5',
          200: '#C6D8CB',
          300: '#A4C0AC',
          400: '#84A78E',
          500: '#6B9077',
          600: '#55755F',
          700: '#445E4D',
          800: '#374B3E',
          900: '#2E3E34',
        },
        charcoal: {
          /* Tuned to clear WCAG AA (4.5:1) on the cream surfaces. */
          400: '#6F706B',
          500: '#5A5C57',
          600: '#4B4D49',
          700: '#353734',
          800: '#262826',
          900: '#1A1C1A',
        },
        gold: '#C9A227',
      },
      fontFamily: {
        sans: [
          'Inter Variable',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        card: '0 1px 2px rgba(26, 28, 26, 0.04), 0 8px 24px -12px rgba(26, 28, 26, 0.10)',
        pop: '0 8px 32px -8px rgba(26, 28, 26, 0.18)',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out both',
      },
    },
  },
  plugins: [],
};
