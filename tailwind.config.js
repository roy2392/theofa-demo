/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kishrey-blue': '#1E40AF',
        'kishrey-light-blue': '#3B82F6',
        'kishrey-green': '#10B981',
        'kishrey-gray': '#6B7280',
      },
      fontFamily: {
        'hebrew': ['Noto Sans Hebrew', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

