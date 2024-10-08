/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('daisyui'),
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  daisyui: {
    themes: ["light", "dark", "cupcake"],
  },
}

