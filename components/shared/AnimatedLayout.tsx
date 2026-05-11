"use client";

export function AnimatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-network-grid page-fade">
      {/* subtle animated gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-to-b from-[#021014]/20 via-transparent to-[#000000]/60 opacity-80" />
      {children}
    </div>
  );
}
