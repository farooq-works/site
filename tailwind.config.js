/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b1120',
        navy: '#101a30',
        brand: '#4f7cff',
        violet: '#8b5cf6',
        mint: '#28d7a1',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 20px 70px rgba(79, 124, 255, 0.22)',
      },
    },
  },
  plugins: [],
}
