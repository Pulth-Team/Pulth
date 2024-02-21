/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        "safe-area": "env(safe-area-inset)",
      },
      minHeight: {
        "content-area": "calc(100vh - 56px)",
      },

      gridTemplateColumns: {
        "dashboard-desktop": "clamp(256px,20vw,288px) 1fr",
        "dashboard-mobile": "56px 1fr",
      },
      gridTemplateRows: {
        "dashboard-desktop": "56px 1fr",
        "dashboard-mobile": "56px 1fr 72px",
      },
    },
    fontFamily: {
      slab: ["Roboto Slab", "sans-serif"],
    },
  },
  plugins: [require("@headlessui/tailwindcss")({ prefix: "ui" })],
};
