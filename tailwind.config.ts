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
        background: "var(--bg)",
        foreground: "var(--fg)",
        accent: "var(--accent)",
        "blood-red": "var(--blood-red)",
        "blood-red-bright": "var(--blood-red-bright)",
        muted: "#888888",
        offwhite: "#f1efe8",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-anton)", "Impact", "Arial Narrow", "sans-serif"],
        "doctor-glitch": ["var(--font-doctor-glitch)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
