/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#09030f",
        plasma: "#14071d",
        neonPink: "#ff4fd8",
        neonGreen: "#7dff7a",
        neonBlue: "#57e7ff",
        hud: "#1a1030",
        panel: "#12091f",
        borderGlow: "#40245f",
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', "cursive"],
        sans: ["Rajdhani", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 0 2px rgba(255,79,216,0.45), 0 0 22px rgba(255,79,216,0.25)",
        green: "0 0 0 2px rgba(125,255,122,0.45), 0 0 22px rgba(125,255,122,0.25)",
        card: "0 18px 50px rgba(5, 1, 10, 0.55)",
      },
      backgroundImage: {
        grid: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        glow: "radial-gradient(circle at top, rgba(255,79,216,0.15), transparent 30%), radial-gradient(circle at bottom, rgba(125,255,122,0.12), transparent 35%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 2px rgba(255,79,216,0.45), 0 0 18px rgba(255,79,216,0.18)" },
          "50%": { boxShadow: "0 0 0 2px rgba(125,255,122,0.5), 0 0 28px rgba(125,255,122,0.24)" },
        },
        marquee: {
          "0%": { transform: "translateX(-65%)" },
          "100%": { transform: "translateX(165%)" },
        },
        flicker: {
          "0%, 19%, 21%, 23%, 80%, 100%": { opacity: "1" },
          "20%, 22%, 79%": { opacity: ".65" },
        },
      },
      animation: {
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.6s ease-in-out infinite",
        marquee: "marquee 2.4s linear infinite",
        flicker: "flicker 3s linear infinite",
      },
    },
  },
  plugins: [],
};
