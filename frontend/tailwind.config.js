/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal: {
          DEFAULT: '#0B6E68',
          dark:    '#094f4a',
          mid:     '#1D9E8F',
          light:   '#E6F5F4',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light:   '#FBF5E8',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
