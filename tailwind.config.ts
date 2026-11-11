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
          blue: "#1e3a8a",
          "blue-dark": "#0f172a",
          "blue-light": "#3b82f6",
          gold: "#d97706",
          "gold-light": "#f59e0b",
          "gold-pale": "#fef3c7",
          red: "#b91c1c",
          "red-dark": "#991b1b",
          "red-light": "#ef4444",
          cream: "#fffbeb",
          surface: "#ffffff",
          background: "#f8fafc",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        tamil: ["var(--font-tamil)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
