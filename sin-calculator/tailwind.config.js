/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0f172a',
        surga: '#10b981',
        neraka: '#ef4444',
        dana: '#0ea5e9'
      }
    },
  },
  plugins: [],
}