import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1200px",
      },
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: {
          DEFAULT: "hsl(var(--surface))",
          subtle: "hsl(var(--surface-subtle))",
          raised: "hsl(var(--surface-raised))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          muted: "hsl(var(--ink-muted))",
          tertiary: "hsl(var(--ink-tertiary))",
        },
        hairline: "hsl(var(--hairline))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          hover: "hsl(var(--accent-hover))",
          subtle: "hsl(var(--accent-subtle))",
        },
        primary: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--surface-subtle))",
          foreground: "hsl(var(--ink))",
        },
        muted: {
          DEFAULT: "hsl(var(--surface-subtle))",
          foreground: "hsl(var(--ink-muted))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--surface-raised))",
          foreground: "hsl(var(--ink))",
        },
        popover: {
          DEFAULT: "hsl(var(--surface-raised))",
          foreground: "hsl(var(--ink))",
        },
        border: "hsl(var(--hairline))",
        input: "hsl(var(--hairline))",
        ring: "hsl(var(--accent))",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        /* Apple-grade display scale */
        "display-2xl": ["4rem",   { lineHeight: "1.05", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-xl":  ["3rem",   { lineHeight: "1.08", letterSpacing: "-0.035em", fontWeight: "700" }],
        "display-lg":  ["2rem",   { lineHeight: "1.15", letterSpacing: "-0.025em", fontWeight: "700" }],
        "display-md":  ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.018em", fontWeight: "600" }],
        "display-sm":  ["1.25rem",{ lineHeight: "1.3",  letterSpacing: "-0.015em", fontWeight: "600" }],
        /* Body scale */
        "body-lg": ["1.0625rem", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
        "body":    ["0.9375rem", { lineHeight: "1.6", letterSpacing: "0em", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        /* Caption / label */
        "caption": ["0.75rem",   { lineHeight: "1.4", letterSpacing: "0em", fontWeight: "400" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
        tighter:  "-0.025em",
        tight:    "-0.018em",
        snug:     "-0.01em",
        normal:   "0em",
      },
      borderRadius: {
        sm:      "0.375rem",   /* 6px */
        DEFAULT: "0.625rem",   /* 10px */
        md:      "0.75rem",    /* 12px */
        lg:      "1.0625rem",  /* 17px — Apple card default */
        xl:      "1.25rem",    /* 20px */
        "2xl":   "1.5rem",     /* 24px */
        "3xl":   "1.875rem",   /* 30px */
        full:    "9999px",
      },
      boxShadow: {
        /* Apple.com / macOS-style shadows — soft, layered */
        card:         "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
        "card-hover": "0 4px 12px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.08)",
        elevated:     "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)",
        sheet:        "0 24px 64px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        focus:        "0 0 0 3px hsl(var(--accent) / 0.25)",
        inset:        "inset 0 1px 2px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        apple:   "cubic-bezier(0.4, 0, 0.2, 1)",
        spring:  "cubic-bezier(0.22, 1, 0.36, 1)",
        /* keep old name for backward compat */
        luxury:  "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%":   { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up":  "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) forwards",
        "fade-in":  "fade-in 0.5s ease-out forwards",
        "scale-in": "scale-in 0.35s cubic-bezier(0.22,1,0.36,1) forwards",
      },
    },
  },
  plugins: [animate],
};

export default config;
