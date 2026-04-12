/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#15803D",
        secondary: "#1E293B",
        accent: "#D97706",
        background: "#F8FAFC"
      }
    },
  },
  plugins: [],
}
