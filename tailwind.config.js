/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'rubik': ['Rubik', 'sans-serif'],
      },
      fontSize: {
        'h1': ['2rem', { lineHeight: '1.2' }],
        'h2': ['1.75rem', { lineHeight: '1.2' }],
        'h3': ['1.5rem', { lineHeight: '1.2' }],
        'h4': ['1.25rem', { lineHeight: '1.2' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'caption': ['0.875rem', { lineHeight: '1.6' }],
        'label': ['0.875rem', { lineHeight: '1.2' }],
      },
    },
  },
  plugins: [],
};
