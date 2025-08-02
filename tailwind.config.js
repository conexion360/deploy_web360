/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#031c3b',
        'primary': '#052752',
        'primary-light': '#0a3d7a',
        'secondary': '#10CDD0',
        'secondary-light': '#3FDADD',
      },
      boxShadow: {
        'glow': '0 0 15px rgba(16, 205, 208, 0.4), 0 0 30px rgba(16, 205, 208, 0.2)',
      },
      textShadow: {
        'glow': '0 0 10px rgba(16, 205, 208, 0.5), 0 0 20px rgba(16, 205, 208, 0.3)',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      const newUtilities = {
        '.text-shadow-glow': {
          textShadow: '0 0 10px rgba(16, 205, 208, 0.5), 0 0 20px rgba(16, 205, 208, 0.3)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
}