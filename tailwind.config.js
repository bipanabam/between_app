/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#f7f5f2",
        primary: "#bc8f97",
        foreground: "#38332e",
        secondary: "#e5e0dc",
        secondaryForeground: "#544d45",
        muted: "#e9e6e2",
        mutedForeground: "#8a8075",
        accent: "#f1ebe4",
        accentForeground: "#464039",
        card: "#f3f0ed",
        cardForeground: "#38332e",
        destructive: "#c27070",
        destructiveForeground: "#fbfaf9",
        border: "#ded9d3",
      },
    },
  },
  plugins: [],
};
