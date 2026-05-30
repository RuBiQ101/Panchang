/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Cormorant Garamond"', 'serif'],
        hindi: ['Martel', 'serif'],
        'tiro-devanagari': ['"Tiro Devanagari Sanskrit"', 'serif'],
      },
      colors: {
        parchment: '#F5F2ED',
        saffron: '#F27D26',
        'saffron-dark': '#D66310',
        ink: '#1A1A1A',
        gold: '#C5A059',
        'rose-gold': {
          '50': '#fef6f5',
          '100': '#fdeee_c',
          '200': '#fbd9d6',
          '300': '#f8c4be',
          '400': '#f39e97',
          '500': '#ee7870',
          '600': '#e55a53',
          '700': '#c9423d',
          '800': '#a33534',
          '900': '#852f2e',
        },
        'cosmic-indigo': '#19122e',
      },
    },
  },
  plugins: [],
}
