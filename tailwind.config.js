/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      spacing: {
        "safe-area": "env(safe-area-inset)",
      },

      gridTemplateColumns: {
        "dashboard-desktop": "288px 1fr",
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
  plugins: [
    require("@tailwindcss/line-clamp"),
    require("@headlessui/tailwindcss")({ prefix: "ui" }),
  ],
};
