import type { Config } from "tailwindcss";
 
const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      colors: {
        surface: {
          950: "#09090b",
          900: "#111115",
          800: "#18181f",
          700: "#1f1f2b",
          600: "#2a2a3a",
        },
        accent: {
          blue:   "#3b82f6",
          cyan:   "#06b6d4",
          violet: "#8b5cf6",
          emerald:"#10b981",
          amber:  "#f59e0b",
          rose:   "#f43f5e",
        },
        glass: "rgba(255,255,255,0.04)",
      },
      backgroundImage: {
        "grid-subtle": "radial-gradient(circle, rgba(59,130,246,0.08) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backdropBlur: {
        glass: "12px",
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.4)",
        glow:  "0 0 20px rgba(59,130,246,0.25)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.2)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s infinite",
        shimmer:     "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
 
export default config;