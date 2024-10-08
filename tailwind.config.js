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
    darkMode: "selector",
    plugins: [require("rippleui")],
    /** @type {import('rippleui').Config} */
    rippleui: {
        themes: [
            {
                themeName: "dark",
                colors: {
                    primary: "#1759f3",
                    error: "#f50a29",
                    success: "#15e007",
                    warning: "#ffd103",
                    backgroundPrimary: "#020202",
                    backgroundSecondary: "#141414",
                    border: "#1a1a1a",
                },
            },
        ],
    },
};
