/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    colors: {
      dark: "#050505", // dark grey
      almostDark: "#181A1F", // dark grey
      darkGrey: "#1E1E1E", // dark grey
      lightGrey: "#858585", // light grey
      textGrey: "#ECECEC", // light grey
      primary: "#1759F3", // blue
      warning: "#FEAD1B", // orange
      success: "#08DA1D", // green
      danger: "#F40F0F", // red
    },
    extend: {
      fontFamily: ["Poppins", "Vazir"],
    },
  },
  plugins: [],
};
