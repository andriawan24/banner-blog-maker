import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Hanken_Grotesk } from "next/font/google";
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
  themeColor: "#211f1b",
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
    if (m) m.setAttribute('content', t === 'light' ? '#f9f7f1' : '#211f1b');
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
      className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${ui.variable} h-full antialiased`}
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
