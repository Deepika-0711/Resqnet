/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Calm in a Crisis - Curated Design Tokens
        ivory: '#F8F7F2',
        paper: '#FFFFFF',
        forest: {
          DEFAULT: '#245C4A',
          hover: '#1D4A3B',
          deep: '#183D31',
          text: '#203B32',
          subtle: '#EDF4EE'
        },
        sage: {
          DEFAULT: '#DCE8DE',
          light: '#EEF4EF',
          muted: '#CBDACD'
        },
        teal: {
          muted: '#6E9C91',
          light: '#EAF1EF'
        },
        coral: {
          DEFAULT: '#E66B55',
          light: '#FCECE9',
          border: '#F5C2BA',
          text: '#B94430'
        },
        amber: {
          warm: '#E7B65C',
          light: '#FCF7ED',
          border: '#F4DCAD',
          text: '#9E6F18'
        },
        grey: {
          soft: '#E8E8E1',
          subtle: '#F2F2ED',
          border: '#DCDCD3'
        },
        ink: {
          primary: '#203B32',
          secondary: '#707970',
          muted: '#929B92'
        },
        // Legacy fallback aliases gracefully mapping to Calm in a Crisis palette
        ops: {
          bg: '#F8F7F2',
          panel: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F4F7F4',
          border: '#E8E8E1',
          borderLight: '#DCDCD3',
          primary: '#203B32',
          secondary: '#707970',
          critical: '#E66B55',
          high: '#E7B65C',
          moderate: '#6E9C91',
          available: '#245C4A',
          route: '#245C4A'
        },
        resq: {
          dark: '#F8F7F2',
          panel: '#FFFFFF',
          card: '#FFFFFF',
          cardHover: '#F4F7F4',
          border: '#E8E8E1',
          borderLight: '#DCDCD3',
          critical: '#E66B55',
          high: '#E7B65C',
          moderate: '#E7B65C',
          low: '#245C4A',
          accent: '#245C4A',
          blue: '#245C4A',
          purple: '#6E9C91',
          textMuted: '#707970'
        }
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Courier New', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(32, 59, 50, 0.04), 0 1px 2px 0 rgba(32, 59, 50, 0.02)',
        'sheet': '0 4px 20px -2px rgba(32, 59, 50, 0.06), 0 2px 6px -1px rgba(32, 59, 50, 0.03)',
        'dropdown': '0 10px 30px -4px rgba(32, 59, 50, 0.1), 0 4px 10px -2px rgba(32, 59, 50, 0.05)'
      }
    },
  },
  plugins: [],
}
