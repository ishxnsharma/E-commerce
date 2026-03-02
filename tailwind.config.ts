import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          light: "#ff9900",
          DEFAULT: "#f90",
          dark: "#e88100",
        },
        amazon: {
          blue: "#131921",
          light: "#232f3e",
          orange: "#f90",
          border: "#D5D9D9",
        }
      },
    },
  },
  plugins: [],
};
export default config;
