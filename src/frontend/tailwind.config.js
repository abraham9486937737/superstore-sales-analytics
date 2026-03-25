export default {
  content: [
    "./index.html",
    "./main.{js,jsx,ts,tsx}",
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./data/**/*.{js,jsx,ts,tsx}",
    "./utils/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        float: "0 16px 45px rgba(15, 23, 42, 0.12)",
      },
      colors: {
        brand: {
          500: "#0B4F6C",
          600: "#073B4C",
        },
      },
    },
  },
  plugins: [],
};
