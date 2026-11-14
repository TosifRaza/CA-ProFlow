/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6fe',
          100: '#e0edff',
          200: '#c2ddfe',
          300: '#94c2fd',
          400: '#5fa0fb',
          500: '#387df8',
          600: '#1660f0',
          700: '#104cd8',
          800: '#133fae',
          900: '#153889',
        },
        navy: {
          800: '#1e293b',
          900: '#0f172a',
        },
        surface: {
          page: '#f0f5fc',
          card: '#ffffff',
          input: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px 0 rgba(0, 0, 0, 0.02)',
        'card': '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
