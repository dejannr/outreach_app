import Link from "next/link";
import type { LeadStatus } from "@prisma/client";

import { LeadStatusBadge } from "@/components/lead-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/dates";

type LeadRow = {
  id: string;
  companyName: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  status: LeadStatus;
  currentStepName?: string | null;
  nextTaskAt?: Date | null;
  lastContactedAt?: Date | null;
  createdAt: Date;
};

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[var(--surface-subtle)] text-[var(--muted-strong)]">
            <tr>
              {[
                "Company",
                "Contact",
                "Email",
                "Phone",
                "Status",
                "Current Step",
                "Next Task",
                "Last Contacted",
                "Created",
                "Actions",
              ].map((heading) => (
                <th
                  key={heading}
                  className="px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.02em]"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="h-12 border-t align-middle transition-colors hover:bg-[var(--surface-subtle)]"
              >
                <td className="px-4 py-3 font-medium text-[var(--ink)]">
                  {lead.companyName}
                </td>
                <td className="px-4 py-3 text-[var(--muted-strong)]">
                  {lead.contactName || "Unknown"}
                </td>
                <td className="px-4 py-3 text-[var(--muted-strong)]">
                  {lead.email || "No email"}
                </td>
                <td className="px-4 py-3 text-[var(--muted-strong)]">
                  {lead.phone || "No phone"}
                </td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-[var(--muted-strong)]">
                  {lead.currentStepName || "Not started"}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {formatDateTime(lead.nextTaskAt)}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {formatDateTime(lead.lastContactedAt)}
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">
                  {formatDateTime(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="secondary">
                      <Link href={`/leads/${lead.id}`}>View lead</Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
