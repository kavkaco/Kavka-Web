/** @type {import('tailwindcss').Config} */
/** @type {import('rippleui').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "Vazirmatn"],
      },
    },
  },
  plugins: [require("rippleui")],
  rippleui: {
    themes: [
      {
        themeName: "dark",
        colorScheme: "dark",
        colors: {
          primary: "#1759f3",
          backgroundPrimary: "#020202",
          backgroundSecondary: "#141414"
        },
      },
    ],
  },
};
