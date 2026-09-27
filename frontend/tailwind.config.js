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
        resq: {
          dark: '#080c14',
          panel: '#0d1322',
          card: '#11192d',
          cardHover: '#17223b',
          border: '#1e2c4a',
          borderLight: '#2a3c63',
          critical: '#ef4444',
          high: '#f97316',
          moderate: '#eab308',
          low: '#10b981',
          accent: '#06b6d4',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          textMuted: '#94a3b8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace']
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'beacon': 'beacon 2s ease-in-out infinite'
      },
      keyframes: {
        beacon: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(1.15)' }
        }
      }
    },
  },
  plugins: [],
}
