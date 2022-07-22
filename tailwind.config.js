/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      keyframes: {
        "shake-keys": {
          "0%": { transform: " " },

          "20%": { transform: "translate(1px, -1px) rotate(2deg)" },
          "40%": { transform: "translate(-1px,-1px) rotate(-2deg)" },
          "50%": { transform: "translate(1px,1px)   rotate(2deg)" },
          "80%": { transform: "translate(-1px,1px)  rotate(-2deg)" },

          "100%": { transform: "" },
        },
      },
      animation: {
        shake: "shake-keys 200ms linear infinite",
      },
    },
  },
  plugins: [],
};
