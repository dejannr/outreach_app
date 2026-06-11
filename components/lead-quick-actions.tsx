"use client";

import { LeadStatus } from "@prisma/client";
import { startTransition } from "react";
import { toast } from "sonner";

import { changeLeadStatusAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";

const actions = [
  { label: "Mark demo booked", status: LeadStatus.DEMO_BOOKED },
  { label: "Mark documents received", status: LeadStatus.DOCUMENTS_RECEIVED },
  { label: "Mark closed won", status: LeadStatus.CLOSED_WON },
  { label: "Mark closed lost", status: LeadStatus.CLOSED_LOST },
  { label: "Pause lead", status: LeadStatus.PAUSED },
];

export function LeadQuickActions({ leadId }: { leadId: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Button
          key={action.label}
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => {
            startTransition(async () => {
              const result = await changeLeadStatusAction({
                leadId,
                status: action.status,
                note: action.label,
              });

              if (!result.success) {
                toast.error(result.error || "Something went wrong");
                return;
              }

              toast.success(result.message || "Lead updated");
            });
          }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
