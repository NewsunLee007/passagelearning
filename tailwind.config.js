/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2F6E63",
        secondary: "#172033",
        accent: "#D9824C",
        background: "#F4F7F7"
      }
    },
  },
  plugins: [],
}
