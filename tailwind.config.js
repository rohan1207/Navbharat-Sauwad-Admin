/** @type {import('tailwindcss').Config} */
module.exports = {

  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#006D5B', // deep green
          900: '#006D5B',
          700: '#0B7A67',
          500: '#B6E2D3',
          300: '#DCE6D5',
          100: '#F7FBF8',
        },
        neutral: {
          900: '#4B4B4B'
        }
      }
    },
  },
  plugins: [require("@tailwindcss/typography")], // Add this line
};
