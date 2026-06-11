"use client";

import { LeadStatus } from "@prisma/client";
import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { changeLeadStatusAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function LeadOverrideForm({
  leadId,
  steps,
  currentStatus,
}: {
  leadId: string;
  steps: { id: string; name: string }[];
  currentStatus: LeadStatus;
}) {
  const form = useForm({
    defaultValues: {
      status: currentStatus,
      stepId: "",
      nextTaskAt: "",
      note: "",
    },
  });

  return (
    <form
      className="space-y-3 rounded-2xl border bg-white p-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await changeLeadStatusAction({
            leadId,
            status: values.status as LeadStatus,
            stepId: values.stepId || undefined,
            nextTaskAt: values.nextTaskAt || undefined,
            note: values.note || undefined,
          });
          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }
          toast.success(result.message || "Lead updated");
        });
      })}
    >
      <div className="grid gap-3 md:grid-cols-2">
        <Select {...form.register("status")}>
          {Object.values(LeadStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Select {...form.register("stepId")}>
          <option value="">Keep current step</option>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </Select>
      </div>
      <Input type="datetime-local" {...form.register("nextTaskAt")} />
      <Textarea placeholder="Manual override note" {...form.register("note")} />
      <Button type="submit" size="sm">
        Save override
      </Button>
    </form>
  );
}
