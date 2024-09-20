import primeui from "tailwindcss-primeui";

const convert = (color) => {
  return `color-mix(in srgb, ${color} calc(100% * <alpha-value>), transparent)`;
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        success: convert("var(--p-green-400)"),
        error: convert("var(--p-red-400)"),
        warning: convert("var(--p-yellow-400)"),
        blue: convert("var(--p-blue-400)"),
      },
    },
  },
  plugins: [primeui],
};
