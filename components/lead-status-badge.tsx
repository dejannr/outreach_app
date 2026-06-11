import type { LeadStatus } from "@prisma/client";

import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const toneMap: Record<LeadStatus, string> = {
  NEW: "bg-slate-100 text-slate-700 border-slate-200",
  ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
  WAITING: "bg-amber-100 text-amber-800 border-amber-200",
  DEMO_BOOKED: "bg-sky-100 text-sky-800 border-sky-200",
  DOCUMENTS_REQUESTED: "bg-orange-100 text-orange-800 border-orange-200",
  DOCUMENTS_RECEIVED: "bg-cyan-100 text-cyan-800 border-cyan-200",
  LOOM_SENT: "bg-indigo-100 text-indigo-800 border-indigo-200",
  PILOT_PROPOSED: "bg-violet-100 text-violet-800 border-violet-200",
  CLOSED_WON: "bg-emerald-200 text-emerald-900 border-emerald-300",
  CLOSED_LOST: "bg-rose-100 text-rose-800 border-rose-200",
  DISQUALIFIED: "bg-stone-200 text-stone-700 border-stone-300",
  NOT_INTERESTED: "bg-red-100 text-red-800 border-red-200",
  PAUSED: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        toneMap[status],
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
