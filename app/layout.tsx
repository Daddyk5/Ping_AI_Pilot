import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AppShell } from "@/components/shared/AppShell";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "PingPilot AI · Find your fastest game server", template: "%s · PingPilot AI" },
  description: "Test Dota 2, MLBB, Delta Force, CS2 and League of Legends server regions from your own connection and get a clear recommendation.",
};

export const viewport: Viewport = {
  themeColor: "#07080b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
        <Analytics />
      </body>
    </html>
  );
}
