import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
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

// Studio chrome: an expressive variable serif for display, a plain
// engineering sans for UI/body, and a mono outlier reserved for the API
// snippet + artboard size readout — never a third body font.
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

const ui = IBM_Plex_Sans({
  variable: "--font-ui",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Banner Generator",
  description: "Generate customizable social and blog banners.",
  manifest: "/site.webmanifest",
  icons: [
    {
      rel: "apple-touch-icon",
      sizes: "180x180",
      url: "/apple-touch-icon.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#171a13",
  colorScheme: "dark light",
};

// Apply the saved/system theme before first paint to avoid a flash of the
// wrong theme. Runs once, synchronously, in <head>.
const noFlashScript = `
(function () {
  try {
    var s = localStorage.getItem('banner-studio:theme');
    var t = s === 'light' || s === 'dark'
      ? s
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.dataset.theme = t;
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', t === 'light' ? '#f8f9f5' : '#171a13');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${ui.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
