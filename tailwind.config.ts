import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          grid: "#e2e8f0",
          wall: "#0f172a",
          highlight: "#38bdf8",
        },
      },
    },
  },
  plugins: [],
};

export default config;
