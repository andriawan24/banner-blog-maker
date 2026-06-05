// Shared types, defaults, and theme tokens for the banner generator.

export type Variant = "editorial" | "terminal" | "spotlight" | "square";
export type Theme = "dark" | "light" | "mid";
export type Background = "none" | "grid" | "dots" | "orb" | "lines";

export type Tweaks = {
  title: string;
  subtitle: string;
  author: string;
  handle: string;
  site: string;
  tag: string;
  date: string;
  readTime: string;
  accent: string;
  background: Background;
  showAvatar: boolean;
  accentLastWord: boolean;
  theme: Theme;
  image: string;
};

export const DEFAULT_TWEAKS: Tweaks = {
  title: "Designing systems that feel almost invisible",
  subtitle:
    "Notes on building a personal site with Next.js, motion.dev, and a stubborn opinion about whitespace.",
  author: "Naufal Andriawan",
  handle: "@andriawan",
  site: "andriawan.dev",
  tag: "engineering",
  date: "May 22, 2026",
  readTime: "6 min",
  accent: "#7DD3A1",
  background: "grid",
  showAvatar: true,
  accentLastWord: true,
  theme: "dark",
  image: "",
};

export const ACCENT_OPTIONS = [
  "#7DD3A1", // emerald
  "#A48BFF", // violet
  "#7DC4E8", // cyan
  "#F2A65A", // amber
  "#E87B7B", // coral
  "#F4F1EA", // bone
];

export const BACKGROUND_OPTIONS: Background[] = [
  "none",
  "grid",
  "dots",
  "orb",
  "lines",
];

export type ThemeTokens = {
  bg: string;
  bgAlt: string;
  fg: string;
  fgMuted: string;
  fgFaint: string;
  line: string;
  card: string;
};

export function themeTokens(theme: Theme): ThemeTokens {
  if (theme === "light") {
    return {
      bg: "#f6f5f1",
      bgAlt: "#ebe9e1",
      fg: "#15140f",
      fgMuted: "rgba(21,20,15,0.62)",
      fgFaint: "rgba(21,20,15,0.35)",
      line: "rgba(21,20,15,0.10)",
      card: "rgba(21,20,15,0.04)",
    };
  }
  if (theme === "mid") {
    return {
      bg: "#1c1b18",
      bgAlt: "#26241f",
      fg: "#f1ede3",
      fgMuted: "rgba(241,237,227,0.65)",
      fgFaint: "rgba(241,237,227,0.38)",
      line: "rgba(241,237,227,0.10)",
      card: "rgba(241,237,227,0.05)",
    };
  }
  // dark (default)
  return {
    bg: "#0b0b0a",
    bgAlt: "#141413",
    fg: "#f4f1ea",
    fgMuted: "rgba(244,241,234,0.65)",
    fgFaint: "rgba(244,241,234,0.38)",
    line: "rgba(244,241,234,0.10)",
    card: "rgba(244,241,234,0.05)",
  };
}
