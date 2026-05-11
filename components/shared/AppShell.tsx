"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { NavBar } from "@/components/shared/NavBar";
import { SafetyBar } from "@/components/shared/SafetyBar";
import { Sidebar } from "@/components/shared/Sidebar";

const publicRoutes = new Set(["/welcome", "/login", "/register"]);

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const isPublicRoute = publicRoutes.has(pathname);

  if (isPublicRoute) {
    return <main className="min-h-screen page-fade">{children}</main>;
  }

  return (
    <>
      <NavBar />
      <div className="flex min-h-[calc(100vh-4rem)] pb-12">
        <Sidebar />
        <motion.main
          key={pathname}
          className="w-full min-w-0 flex-1"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {children}
        </motion.main>
      </div>
      <SafetyBar />
    </>
  );
}
