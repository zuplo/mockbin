import type { ZudokuConfig } from "zudoku";

const config: ZudokuConfig = {
  site: {
    title: "Mockbin by Zuplo",
    logo: {
      src: {
        light: "/logo-light.svg",
        dark: "/logo-dark.svg",
      },
      alt: "Mockbin",
      width: "120px",
    },
  },
  metadata: {
    title: "Mockbin by Zuplo",
    description:
      "Mockbin is an open-source, fully-free tool that lets you mock an API endpoint and inspect requests sent to it.",
    favicon: "/favicon.ico",
  },
  navigation: [
    {
      type: "category",
      label: "Getting started",
      items: ["intro", "usage"],
    },
    {
      type: "link",
      label: "API reference",
      to: "/api",
    },
    {
      type: "link",
      label: "GitHub",
      to: "https://github.com/zuplo/mockbin",
    },
  ],
  apis: [
    {
      type: "file",
      input: "../config/routes.oas.json",
      path: "/api",
      navigationId: "mockbin-api",
    },
  ],
  theme: {
    light: {
      primary: "#ff00bd",
      primaryForeground: "#ffffff",
      background: "#ffffff",
      foreground: "#111827",
      muted: "#f3f4f6",
      mutedForeground: "#6b7280",
      border: "#e5e7eb",
      ring: "#ff00bd",
      accent: "#fff0fb",
      accentForeground: "#ff00bd",
    },
    dark: {
      primary: "#ff00bd",
      primaryForeground: "#ffffff",
      background: "#0a0a0f",
      foreground: "#f9fafb",
      muted: "#1f2937",
      mutedForeground: "#9ca3af",
      border: "#1f2937",
      ring: "#ff00bd",
      accent: "#2d0a22",
      accentForeground: "#ff00bd",
    },
  },
  fonts: {
    sans: {
      url: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    display: {
      url: "https://fonts.googleapis.com/css2?family=Readex+Pro:wght@400;500;600;700&display=swap",
      fontFamily: "'Readex Pro', ui-sans-serif, system-ui, sans-serif",
    },
    mono: {
      url: "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600&display=swap",
      fontFamily: "'Fira Code', 'SF Mono', ui-monospace, monospace",
    },
  },
  footer: {
    columns: [
      {
        title: "Mockbin",
        links: [
          { label: "Home", href: "https://mockbin.io" },
          {
            label: "GitHub",
            href: "https://github.com/zuplo/mockbin",
          },
        ],
      },
      {
        title: "Zuplo",
        links: [
          { label: "Zuplo", href: "https://zuplo.com" },
          { label: "Zudoku", href: "https://zudoku.dev" },
        ],
      },
    ],
    copyright: `© ${new Date().getFullYear()} Zuplo. Built with Zudoku.`,
  },
};

export default config;
