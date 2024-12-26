/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Include your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // Include all JS/TS/React component files
    "./src/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {}, // Extend default Tailwind theme if needed
  },
  plugins: [],
};
