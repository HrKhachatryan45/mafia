/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily:{
        customOne:["Courgette","serif"]
      }
    },
  },
  plugins: [
    require('daisyui')
  ],
}