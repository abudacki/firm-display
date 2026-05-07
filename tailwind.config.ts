import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-display)", "Inter", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#101826",
        linen: "#f5f1e8",
        cypress: "#0f3d35",
        brass: "#b98f45",
        mist: "#e7eef0",
        berry: "#7d2948"
      },
      boxShadow: {
        display: "0 24px 70px rgba(16, 24, 38, 0.26)"
      }
    }
  },
  plugins: []
};

export default config;
