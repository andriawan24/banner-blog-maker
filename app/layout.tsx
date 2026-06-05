import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

// Banner internals render with Geist (part of the saved design output).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Generator chrome: a characterful grotesque for headings, a warm body grotesque for UI.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

const ui = Hanken_Grotesk({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banner Generator",
  description: "Generate customizable social and blog banners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${ui.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
