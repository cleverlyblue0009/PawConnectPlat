/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rust: {
          DEFAULT: '#C06D4E',
          50: '#F5EBE7',
          100: '#EBD7CE',
          200: '#DCBFB0',
          300: '#CDA792',
          400: '#BE8F74',
          500: '#C06D4E',
          600: '#A55A3D',
          700: '#7E452F',
          800: '#573021',
          900: '#301B13',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
