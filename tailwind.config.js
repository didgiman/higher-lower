/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'atma': ['Atma', 'system-ui'],
        'luckiest-guy': ['Luckiest Guy', 'cursive']
      }
    },
  },
  plugins: [],
}