import type { Config } from "tailwindcss";

// TargetBoard brand colours per spec §5.2
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        tb: {
          ink: "#2C2C2C",
          accent: "#1A73E8",
          paper: "#FFFFFF",
          muted: "#6B7280",
          border: "#E5E7EB",
          surface: "#F9FAFB",
          ok: "#16A34A",
          warn: "#D97706",
          err: "#DC2626",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
