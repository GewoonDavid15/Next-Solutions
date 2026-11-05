import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1rem", sm: "1.5rem", lg: "2rem" },
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Huisstijl Next Solutions: lime #C6F432, donker #0A0C10, tegel #11141B, rand #2A3040
        ink: { DEFAULT: "#0A0C10", 900: "#0D1015", 800: "#11141B", 700: "#1A1F29" },
        line: "#2A3040",
        brand: {
          50: "#FAFFE8",
          100: "#F3FECB",
          200: "#E8FC9C",
          300: "#DAF96A",
          400: "#CFF74A",
          500: "#C6F432",
          600: "#C6F432",
          700: "#A8DB1A",
          800: "#7A9D12",
          900: "#4F6612",
        },
        status: { red: "#FF6B6B", orange: "#FF9B5E", amber: "#FFB547", blue: "#6E9BFF", grey: "#7D8494" },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #DAF96A 0%, #C6F432 50%, #A8DB1A 100%)",
        "ink-gradient": "linear-gradient(180deg, #0A0C10 0%, #11141B 50%, #0A0C10 100%)",
        "grid-pattern":
          "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
      },
      boxShadow: {
        glow: "0 0 24px -6px rgba(198, 244, 50, 0.45)",
        "glow-lg": "0 0 48px -8px rgba(198, 244, 50, 0.5)",
        glass: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 32px -8px rgba(0,0,0,0.6)",
      },
      keyframes: {
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-20px) rotate(6deg)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 4px rgba(198,244,50,0.4))" },
          "50%": { opacity: "0.8", filter: "drop-shadow(0 0 12px rgba(198,244,50,0.75))" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
        blink: { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0" } },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "gradient-x": "gradient-x 8s ease infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 11s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.4s ease-in-out infinite",
        "ping-slow": "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite",
        blink: "blink 1s step-end infinite",
        "accordion-down": "accordion-down 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        "accordion-up": "accordion-up 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
