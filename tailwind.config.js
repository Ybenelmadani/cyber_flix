/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleurs Cyberpunk personnalisées
        cyber: {
          dark: '#020617',      // Fond très sombre
          darker: '#0f172a',    // Fond secondaire
          cyan: '#22d3ee',      // Cyan néon
          'cyan-glow': '#67e8f9',
          fuchsia: '#e879f9',   // Fuchsia néon
          'fuchsia-glow': '#f0abfc',
          violet: '#8b5cf6',    // Violet
          'violet-glow': '#a78bfa',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #22d3ee, 0 0 10px #22d3ee' },
          '100%': { boxShadow: '0 0 20px #e879f9, 0 0 30px #e879f9' },
        }
      },
      backgroundImage: {
        'cyber-gradient': 'linear-gradient(135deg, #22d3ee 0%, #8b5cf6 50%, #e879f9 100%)',
        'dark-gradient': 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
      }
    },
  },
  plugins: [
    
  require("tailwindcss-animate"),

  ],
}