/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Heebo", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Suez One", "Heebo", "serif"],
      },
      colors: {
        brand: {
          50: "#FFF6FA",
          100: "#FFE4F0",
          200: "#FFC2DC",
          300: "#FF9AC6",
          400: "#F472B6",
          500: "#E85A9B",
          600: "#D44A88",
          700: "#C64B79",
          800: "#9D3A5F",
          900: "#7A2D4A",
        },
        ink: "#4A2040",
        sand: "#FFF6FA",
        coral: "#E85D6F",
        gold: "#E8B84A",
        lavender: "#C4B5FD",
        berry: "#7A2D4A",
      },
      boxShadow: {
        soft: "0 8px 30px rgba(198, 75, 121, 0.15)",
        glow: "0 0 24px rgba(232, 184, 74, 0.35)",
      },
    },
  },
  plugins: [],
};
