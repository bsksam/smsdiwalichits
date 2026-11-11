import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          // Deep Luxury Maroon / Burgundy (from Photo 2)
          maroon: {
            950: "#1d0004",
            900: "#2b0007",
            850: "#38000b",
            800: "#480210",
            700: "#5c0517",
            600: "#730a20",
            500: "#8e0f2b",
          },
          // Gleaming Radiant Gold (from Photo 2)
          gold: {
            light: "#fef08a",
            DEFAULT: "#d4af37",
            hover: "#e5b839",
            rich: "#f3c853",
            dark: "#b48a1b",
            deep: "#856209",
          },
          surface: "#35010a",
          surfaceLight: "#46030f",
          border: "rgba(212, 175, 55, 0.25)",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        serif: ["Georgia", "Cambria", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
