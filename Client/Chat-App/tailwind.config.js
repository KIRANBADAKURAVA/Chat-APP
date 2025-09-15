/** @type {import('tailwindcss').Config} */
export default {
  content: [ "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          primary: '#1a1a1a',
          secondary: '#2d2d2d',
          tertiary: '#3a3a3a',
          text: '#e5e5e5',
          textSecondary: '#a0a0a0',
          border: '#404040',
          accent: '#3b82f6',
          accentHover: '#2563eb',
        }
      }
    },
  },
  plugins: [],
}

