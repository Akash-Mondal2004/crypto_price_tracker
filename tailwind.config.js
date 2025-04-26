/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      backgroundColor: {
        'dark-primary': '#1a1a1a',
        'dark-secondary': '#2d2d2d',
      },
      textColor: {
        'dark-primary': '#ffffff',
        'dark-secondary': '#a0aec0',
      }
    },
  },
  plugins: [],
}

