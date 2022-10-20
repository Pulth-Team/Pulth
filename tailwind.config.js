/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        "safe-area": "env(safe-area-inset)",
      },
    },
  },
  plugins: [],
};
