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
    <aside className="flex h-full flex-col rounded-xl border bg-white p-4">
      <div className="space-y-2 border-b border-[var(--line)] pb-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
          TruckA Company
        </p>
        <div>
          <h2 className="text-lg font-semibold text-[var(--ink)]">TruckA Outreach</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Script-driven daily command center.
          </p>
        </div>
      </div>
      <nav className="mt-5 flex flex-1 flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-[var(--accent-soft)] text-[var(--accent-ink)]"
                  : "text-[var(--muted-strong)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]",
              )}
            >
              <Icon className="h-4 w-4 stroke-[1.9]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] p-3 text-sm text-[var(--muted)]">
        <p className="font-medium text-[var(--ink)]">Workflow rule</p>
        <p className="mt-1">Selected outcome → next step → next due date.</p>
      </div>
    </aside>
  );
}
