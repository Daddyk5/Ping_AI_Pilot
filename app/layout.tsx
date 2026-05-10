import type { Metadata } from "next";
import { AppShell } from "@/components/shared/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "PingPilot AI",
  description: "Technical network telemetry dashboard for competitive gaming.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
