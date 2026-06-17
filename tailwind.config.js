/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: '#FFFFFF',
        accent: {
          DEFAULT: '#A8678A',
          hover: '#BF90A9',
        },
        border: '#E7E1D8',
        'hover-bg': '#F8EFF3',
        'primary-text': '#1F1F1F',
        'secondary-text': '#6E6A65',
        'page-bg': '#F6F2E8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.06)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
