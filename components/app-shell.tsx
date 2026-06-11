"use client";

import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/sidebar";

export function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1680px] flex-col gap-6 p-4 lg:flex-row lg:p-6">
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[248px] lg:flex-none">
        <Sidebar pathname={pathname} />
      </div>
      <main className="min-w-0 flex-1 pb-10">{children}</main>
    </div>
  );
}
