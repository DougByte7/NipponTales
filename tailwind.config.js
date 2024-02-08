/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: "#ff1335",
        secondary: "#f5e0b3",
        support: {
          100: "#fdf9ef",
          200: "#6f7179",
          600: "#404864",
          700: "#252836",
          900: "#1F1D2B",
        },
      },
    },
  },
  plugins: [],
};
