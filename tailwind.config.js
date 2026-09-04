/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  // 앱은 라이트 고정(app.json userInterfaceStyle: light). 'class'로 두면
  // react-navigation이 스킴을 설정할 때 NativeWind가 던지는 에러를 피한다.
  darkMode: "class",
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
