/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        pink: {
          50:  '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
        },
        orange: {
          400: '#fb923c',
          500: '#f97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7c3aed 0%, #ec4899 50%, #f97316 100%)',
        'soft-gradient': 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 50%, #fff7ed 100%)',
        'card-gradient': 'linear-gradient(145deg, #ffffff 0%, #faf9ff 100%)',
      },
      boxShadow: {
        'soft':    '0 2px 16px 0 rgba(124, 58, 237, 0.08)',
        'card':    '0 4px 24px 0 rgba(124, 58, 237, 0.10)',
        'glow':    '0 0 24px 0 rgba(139, 92, 246, 0.25)',
        'pink-glow':'0 0 24px 0 rgba(236, 72, 153, 0.20)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
