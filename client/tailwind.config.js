/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        pm: {
          // LeetCode-inspired Dark Neutral Palette
          bg: '#1A1A1A',
          card: '#262626',
          surface: '#2D2D2D',
          border: '#3A3A3A',
          borderHover: 'rgba(255, 138, 0, 0.45)',
          
          // Typography Hierarchy
          text: '#F5F5F5',
          textMuted: '#A0A0A0',
          muted: '#777777',
          disabled: '#555555',
          
          // Project Match Orange Accent
          orange: '#FF8A00',
          orangeHover: '#FF9E2C',
          orangeSoft: 'rgba(255, 138, 0, 0.10)',
          orangeBorder: 'rgba(255, 138, 0, 0.35)',
          
          // Functional Accents
          green: '#22C55E',
          greenSoft: 'rgba(34, 197, 94, 0.10)',
          blue: '#3B82F6',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      },
      borderRadius: {
        'card': '10px',
        'card-lg': '12px',
        'input': '8px',
        'btn': '8px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.20)',
        'modal': '0 10px 30px rgba(0, 0, 0, 0.35)',
        'orange-subtle': '0 0 15px rgba(255, 138, 0, 0.20)',
      }
    },
  },
  plugins: [],
}
