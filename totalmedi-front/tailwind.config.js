/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#00c9cb',
        secondary: '#34495e',
        background: '#f6f6f6',
      },
    },
  },
  plugins: [],
};