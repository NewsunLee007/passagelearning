/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#166534",
        secondary: "#1F2937",
        accent: "#C26534",
        background: "#F6F2E9"
      }
    },
  },
  plugins: [],
}
