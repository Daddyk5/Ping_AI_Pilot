"use client";

import { usePathname } from "next/navigation";
import { NavBar } from "@/components/shared/NavBar";
import { SafetyBar } from "@/components/shared/SafetyBar";
import { Sidebar } from "@/components/shared/Sidebar";

const publicRoutes = new Set(["/welcome", "/login", "/register"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPublicRoute = publicRoutes.has(pathname);

  if (isPublicRoute) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <NavBar />
      <div className="flex min-h-[calc(100vh-4rem)] pb-12">
        <Sidebar />
        <main className="w-full min-w-0 flex-1">{children}</main>
      </div>
      <SafetyBar />
    </>
  );
}
