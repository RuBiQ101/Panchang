/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        hindi: ['Martel', 'serif'],
        'tiro-devanagari': ['"Tiro Devanagari Sanskrit"', 'serif'],
      },
      colors: {
        parchment: '#F5F5F7',
        saffron: '#FF9500',
        'saffron-dark': '#FF7A00',
        ink: '#1D1D1F',
        gold: '#A2845E',
        'rose-gold': {
          '50': '#FFFFFF',
          '100': '#F5F5F7',
          '200': '#E5E5E7',
          '300': '#D5D5D7',
          '400': '#86868B',
          '500': '#FF9500',
          '600': '#FF8C00',
          '700': '#FF7A00',
          '800': '#A2845E',
          '900': '#1D1D1F',
        },
        'cosmic-indigo': '#1d1d2e',
      },
    },
  },
  plugins: [],
}
