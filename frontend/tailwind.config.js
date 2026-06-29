/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          text: '#f8fafc',
          border: '#334155'
        },
        primary: {
          500: '#3b82f6',
          600: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
