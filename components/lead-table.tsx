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
          <thead className="bg-[var(--card-strong)] text-[var(--muted)]">
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
                <th key={heading} className="px-4 py-3 font-semibold">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t align-top">
                <td className="px-4 py-4 font-semibold">{lead.companyName}</td>
                <td className="px-4 py-4">{lead.contactName || "Unknown"}</td>
                <td className="px-4 py-4">{lead.email || "No email"}</td>
                <td className="px-4 py-4">{lead.phone || "No phone"}</td>
                <td className="px-4 py-4">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-4">{lead.currentStepName || "Not started"}</td>
                <td className="px-4 py-4">{formatDateTime(lead.nextTaskAt)}</td>
                <td className="px-4 py-4">{formatDateTime(lead.lastContactedAt)}</td>
                <td className="px-4 py-4">{formatDateTime(lead.createdAt)}</td>
                <td className="px-4 py-4">
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
