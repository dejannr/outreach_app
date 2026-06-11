import Link from "next/link";
import { ListChecks, NotebookPen, Settings, Workflow } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/start-working", label: "Start Working", icon: ListChecks },
  { href: "/leads", label: "Leads", icon: NotebookPen },
  { href: "/scripts", label: "Scripts", icon: Workflow },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside className="grain flex h-full flex-col rounded-[2rem] border bg-white/80 p-5 backdrop-blur-sm">
      <div className="space-y-3 border-b pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.26em] text-[var(--muted)]">
          TruckA Company
        </p>
        <div>
          <h2 className="text-2xl font-extrabold">TruckA Outreach</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Script-driven daily command center.
          </p>
        </div>
      </div>
      <nav className="mt-6 flex flex-1 flex-col gap-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-transparent hover:border-[var(--line)] hover:bg-[var(--card)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-2xl border bg-[var(--card-strong)] p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--ink)]">Daily rule</p>
        <p className="mt-1">Selected outcome → next step → next due date.</p>
      </div>
    </aside>
  );
}
