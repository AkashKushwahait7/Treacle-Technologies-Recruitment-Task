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
        fleet: {
          bg: '#090D16',       // Deep midnight slate background
          card: '#0F172A',     // Card surface
          cardHover: '#131D33',// Hover card surface
          subtle: '#1E293B',   // Subtle secondary background
          border: '#1E293B',   // Dark border
          borderLight: '#334155', // Lighter border
          muted: '#64748B',    // Muted text
          text: '#F1F5F9',     // Main bright text
          textSecondary: '#94A3B8', // Secondary text
          primary: '#4F46E5',  // Indigo primary
          primaryHover: '#4338CA',
          accent: '#38BDF8',   // Sky accent
          success: '#10B981',  // Emerald success
          warning: '#F59E0B',  // Amber warning
          critical: '#EF4444', // Rose critical
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.25s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
