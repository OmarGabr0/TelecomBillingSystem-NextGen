import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        "gradient-blue": "linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)",
        "gradient-violet": "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
        "gradient-emerald": "linear-gradient(135deg, #10b981 0%, #14b8a6 100%)",
      },
      backdropBlur: {
        glass: "12px",
        xl: "32px",
      },
      boxShadow: {
        glass: "0 0 0 1px rgba(255,255,255,0.06), 0 4px 32px rgba(0,0,0,0.4)",
        glow:  "0 0 20px rgba(59,130,246,0.25)",
        "glow-emerald": "0 0 20px rgba(16,185,129,0.2)",
        "glow-violet": "0 0 30px rgba(139,92,246,0.3)",
        "card-hover": "0 20px 60px rgba(0,0,0,0.6)",
      },
      animation: {
        "fade-up":   "fadeUp 0.5s ease forwards",
        "fade-in":   "fadeIn 0.6s ease forwards",
        "pulse-slow": "pulse 3s infinite",
        shimmer:     "shimmer 1.5s infinite",
        "slide-in": "slideIn 0.4s ease forwards",
        "scale-in": "scaleIn 0.3s ease forwards",
        float: "float 3s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%":   { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
      },
      transitionDuration: {
        smooth: "300ms",
        "smooth-slow": "500ms",
      },
    },
  },
  plugins: [],
};

export default config;