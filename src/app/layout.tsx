import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kintsugi · Salvage Portal",
  description:
    "Salvage orphaned technical assets, earn Mianzi credits on reuse, and export legacy intelligence via Smart Bridge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const githubAuth = Boolean(process.env.AUTH_GITHUB_ID);

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="bg-[#1a1a1a] text-foreground min-h-full flex flex-col">
        <Providers>
          <SiteHeader githubAuthConfigured={githubAuth} />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-[#d4af37]/15 py-6 text-center text-xs text-muted-foreground">
            Kintsugi · Prototype demo: library and leaderboard use sample data; sign in with
            GitHub to simulate salvage, reuse, and Mianzi in your browser.
          </footer>
        </Providers>
      </body>
    </html>
  );
}
