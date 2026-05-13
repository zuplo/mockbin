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
        zuplo: {
          primary: "#ff00bd",
          "primary-hover": "#e600aa",
          "primary-light": "#fff0fb",
        },
        accent: {
          DEFAULT: "#ff00bd",
          hover: "#e600aa",
          light: "#fff0fb",
        },
        fg: {
          DEFAULT: "#111827",
          secondary: "#374151",
          muted: "#6b7280",
          faint: "#9ca3af",
        },
        bg: {
          DEFAULT: "#ffffff",
          subtle: "#f9fafb",
          muted: "#f3f4f6",
        },
        line: {
          DEFAULT: "#e5e7eb",
          strong: "#d1d5db",
        },
        success: {
          DEFAULT: "#10b981",
          bg: "#ecfdf5",
        },
        danger: {
          DEFAULT: "#e11d48",
          bg: "#ffe4e6",
        },
        warn: {
          DEFAULT: "#f59e0b",
          bg: "#fffbeb",
          border: "#fde68a",
          text: "#b45309",
        },
        info: {
          DEFAULT: "#6366f1",
          bg: "#e0e7ff",
        },
        code: {
          bg: "#1e1e2e",
          fg: "#cdd6f4",
        },
      },
      fontFamily: {
        display: ["Readex Pro", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: [
          "Fira Code",
          "SF Mono",
          "ui-monospace",
          "Cascadia Code",
          "JetBrains Mono",
          "monospace",
        ],
        system: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        sm: "0 1px 3px rgba(0,0,0,0.04)",
        md: "0 2px 12px rgba(0,0,0,0.07)",
        lg: "0 6px 24px rgba(0,0,0,0.10)",
        xl: "0 20px 60px rgba(0,0,0,0.18)",
        accent: "0 1px 6px rgba(255,0,189,0.35)",
        focus: "0 0 0 3px rgba(255,0,189,0.08)",
      },
      borderRadius: {
        tag: "4px",
      },
      maxWidth: {
        content: "1200px",
      },
    },
  },
  plugins: [],
};
export default config;
