"use client";

import { LeadStatus } from "@prisma/client";
import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
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
      delayChoice:
        defaults?.requiresDateTime
          ? "choose_when_completing"
          : defaults?.delayDays === 0
            ? "immediately"
            : defaults?.delayDays === 1
              ? "tomorrow"
              : defaults?.delayDays === 2
                ? "in_2_days"
                : defaults?.delayDays === 3
                  ? "in_3_days"
                  : defaults?.delayDays === 5
                    ? "in_5_days"
                    : defaults?.delayDays === 7
                      ? "in_7_days"
                      : "custom",
      actionType:
        defaults?.isTerminal && defaults?.setLeadStatus === LeadStatus.CLOSED_WON
          ? "mark_won"
          : defaults?.isTerminal &&
              defaults?.setLeadStatus === LeadStatus.CLOSED_LOST
            ? "mark_lost"
            : defaults?.isTerminal &&
                defaults?.setLeadStatus === LeadStatus.NOT_INTERESTED
              ? "mark_not_interested"
              : defaults?.isTerminal &&
                  defaults?.setLeadStatus === LeadStatus.DISQUALIFIED
                ? "mark_disqualified"
                : "go_to_step",
      setLeadStatus: defaults?.setLeadStatus || undefined,
      isTerminal: defaults?.isTerminal || false,
      requiresNote: defaults?.requiresNote || false,
      requiresDateTime: defaults?.requiresDateTime || false,
      requiresContact: defaults?.requiresContact || false,
      sortOrder: defaults?.sortOrder || 0,
    },
  });

  const actionType = useWatch({ control: form.control, name: "actionType" });
  const delayChoice = useWatch({ control: form.control, name: "delayChoice" });

  return (
    <form
      className="space-y-4 rounded-lg border bg-white p-4"
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
        <Input placeholder="Outcome label" {...form.register("label")} />
        <Select {...form.register("actionType")}>
          <option value="go_to_step">Go to another step</option>
          <option value="create_manual_task">Create a manual task</option>
          <option value="stop_sequence">Stop sequence</option>
          <option value="mark_won">Mark lead as won</option>
          <option value="mark_lost">Mark lead as lost</option>
          <option value="mark_not_interested">Mark not interested</option>
          <option value="mark_disqualified">Mark disqualified</option>
        </Select>
        {actionType === "go_to_step" ? (
          <Select {...form.register("nextStepId")}>
            <option value="">Select next step</option>
            {steps.map((step) => (
              <option key={step.id} value={step.id}>
                {step.name}
              </option>
            ))}
          </Select>
        ) : (
          <div className="rounded-md border bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--muted)]">
            {actionType === "create_manual_task"
              ? "This will create a manual follow-up task."
              : "This outcome will end the current sequence."}
          </div>
        )}
        <Select {...form.register("delayChoice")}>
          <option value="immediately">Immediately</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="in_2_days">In 2 days</option>
          <option value="in_3_days">In 3 days</option>
          <option value="in_5_days">In 5 days</option>
          <option value="in_7_days">In 7 days</option>
          <option value="choose_when_completing">
            Choose date/time when completing task
          </option>
          <option value="custom">Custom delay</option>
        </Select>
        {delayChoice === "custom" ? (
          <Input
            type="number"
            min={0}
            placeholder="Custom delay days"
            {...form.register("delayDays")}
          />
        ) : null}
      </div>

      <Textarea placeholder="Optional description" {...form.register("description")} />

      <details className="rounded-lg border bg-[var(--surface-subtle)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
          Advanced outcome settings
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input placeholder="Outcome key" {...form.register("key")} />
          <Input placeholder="Metric key" {...form.register("metricKey")} />
          <Select {...form.register("setLeadStatus")}>
            <option value="">Lead status</option>
            {Object.values(LeadStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Input
            type="number"
            min={0}
            placeholder="Sort order"
            {...form.register("sortOrder")}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("isTerminal")} />
            Terminal
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("requiresNote")} />
            Requires note
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("requiresDateTime")} />
            Requires date/time
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("requiresContact")} />
            Requires contact
          </label>
        </div>
      </details>

      <Button type="submit" size="sm">
        {outcomeId ? "Update outcome" : "Add outcome"}
      </Button>
    </form>
  );
}
