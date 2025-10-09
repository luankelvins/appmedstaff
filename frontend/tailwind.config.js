/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medstaff: {
          primary: '#2D4A5C', // Azul escuro do logo
          secondary: '#7FB3C3', // Azul claro do logo
          accent: '#A8D5E2', // Azul mais claro
          dark: '#1A2B35', // Azul muito escuro
          light: '#E8F4F8', // Azul muito claro para backgrounds
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'medstaff': '0 4px 6px -1px rgba(45, 74, 92, 0.1), 0 2px 4px -1px rgba(45, 74, 92, 0.06)',
      }
    },
  },
  plugins: [],
}