"use client";

import { LeadStatus } from "@prisma/client";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createScriptOutcomeAction,
  updateScriptOutcomeAction,
} from "@/app/actions/scripts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { outcomeSchema } from "@/lib/validations";

type OutcomeFormProps = {
  stepId: string;
  steps: { id: string; name: string }[];
  outcomeId?: string;
  defaults?: {
    label: string;
    key: string;
    metricKey: string;
    description?: string | null;
    nextStepId?: string | null;
    delayDays: number;
    setLeadStatus?: LeadStatus | null;
    isTerminal: boolean;
    requiresNote: boolean;
    requiresDateTime: boolean;
    requiresContact: boolean;
    sortOrder: number;
  };
};

export function OutcomeForm({
  stepId,
  steps,
  outcomeId,
  defaults,
}: OutcomeFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(outcomeSchema),
    defaultValues: {
      stepId,
      label: defaults?.label || "",
      key: defaults?.key || "",
      metricKey: defaults?.metricKey || "",
      description: defaults?.description || "",
      nextStepId: defaults?.nextStepId || "",
      delayDays: defaults?.delayDays || 0,
      setLeadStatus: defaults?.setLeadStatus || undefined,
      isTerminal: defaults?.isTerminal || false,
      requiresNote: defaults?.requiresNote || false,
      requiresDateTime: defaults?.requiresDateTime || false,
      requiresContact: defaults?.requiresContact || false,
      sortOrder: defaults?.sortOrder || 0,
    },
  });

  return (
    <form
      className="space-y-4 rounded-2xl border bg-white p-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = outcomeId
            ? await updateScriptOutcomeAction(outcomeId, values)
            : await createScriptOutcomeAction(values);
          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success(result.message || "Outcome saved");
          router.refresh();
        });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Label" {...form.register("label")} />
        <Input placeholder="Key" {...form.register("key")} />
        <Input placeholder="Metric key" {...form.register("metricKey")} />
        <Select {...form.register("nextStepId")}>
          <option value="">No next step</option>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </Select>
        <Input type="number" min={0} placeholder="Delay days" {...form.register("delayDays")} />
        <Select {...form.register("setLeadStatus")}>
          <option value="">Lead status</option>
          {Object.values(LeadStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
        <Input type="number" min={0} placeholder="Sort order" {...form.register("sortOrder")} />
      </div>
      <Textarea placeholder="Description" {...form.register("description")} />
      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("isTerminal")} />
          Terminal
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("requiresNote")} />
          Requires note
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("requiresDateTime")} />
          Requires date/time
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" {...form.register("requiresContact")} />
          Requires contact
        </label>
      </div>
      <Button type="submit" size="sm">
        {outcomeId ? "Update outcome" : "Add outcome"}
      </Button>
    </form>
  );
}
