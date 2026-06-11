import type { LeadStatus } from "@prisma/client";

import { LEAD_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const toneMap: Record<LeadStatus, string> = {
  NEW: "bg-slate-50 text-slate-600 border-slate-200",
  ACTIVE: "bg-blue-50 text-blue-700 border-blue-200",
  WAITING: "bg-amber-100 text-amber-800 border-amber-200",
  DEMO_BOOKED: "bg-blue-50 text-blue-700 border-blue-200",
  DOCUMENTS_REQUESTED: "bg-amber-50 text-amber-800 border-amber-200",
  DOCUMENTS_RECEIVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  LOOM_SENT: "bg-blue-50 text-blue-700 border-blue-200",
  PILOT_PROPOSED: "bg-blue-50 text-blue-700 border-blue-200",
  CLOSED_WON: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED_LOST: "bg-red-50 text-red-700 border-red-200",
  DISQUALIFIED: "bg-red-50 text-red-700 border-red-200",
  NOT_INTERESTED: "bg-red-50 text-red-700 border-red-200",
  PAUSED: "bg-slate-100 text-slate-600 border-slate-300",
};

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md border px-2.5 text-xs font-medium",
        toneMap[status],
      )}
    >
      {LEAD_STATUS_LABELS[status]}
    </span>
  );
}
