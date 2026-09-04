/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        coral: "#FF6B45",
        "coral-dark": "#E5502B",
        "coral-soft": "#FFE7DC",
        bg: "#FFF8F5",
        ink: "#2B1710",
        "ink-muted": "#8C6F63",
        border: "#F3E0D8",
      },
    },
  },
  plugins: [],
};
