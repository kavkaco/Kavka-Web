/** @type {import('tailwindcss').Config} */
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
  /** @type {import('rippleui').Config} */
  rippleui: {
    defaultStyle: "dark",
    removeThemes: "light",
    themes: [
      {
        themeName: "dark",
        colorScheme: "dark",
        colors: {
          primary: "#1759f3",
          backgroundPrimary: "#020202",
          backgroundSecondary: "#141414",
          border: "#1a1a1a",
        },
      },
    ],
  },
};
