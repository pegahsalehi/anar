import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        "background-alt": "rgb(var(--background-alt) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        "card-foreground": "rgb(var(--card-foreground) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        "muted-foreground": "rgb(var(--muted-foreground) / <alpha-value>)",
        primary: "rgb(var(--primary) / <alpha-value>)",
        "primary-foreground": "rgb(var(--primary-foreground) / <alpha-value>)",
        coral: "rgb(var(--coral) / <alpha-value>)",
        "coral-foreground": "rgb(var(--coral-foreground) / <alpha-value>)",
        fresh: "rgb(var(--fresh) / <alpha-value>)",
        "fresh-foreground": "rgb(var(--fresh-foreground) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
      },
      boxShadow: {
        soft: "0 16px 34px rgb(16 42 67 / 0.08)",
      },
      borderRadius: {
        sm: "12px",
        md: "16px",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Manrope",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
