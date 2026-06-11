"use client";

import { StepChannel } from "@prisma/client";
import { startTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  createScriptStepAction,
  updateScriptStepAction,
} from "@/app/actions/scripts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { stepSchema } from "@/lib/validations";
import { defaultStepContent } from "@/lib/workflow-defaults";

type StepFormProps = {
  scriptVersionId: string;
  stepId?: string;
  defaults?: {
    name: string;
    key: string;
    metricKey: string;
    channel: StepChannel;
    subject?: string | null;
    scriptText: string;
    instructions?: string | null;
    defaultDelayDays: number;
    sortOrder: number;
    isStartStep: boolean;
    isTerminalStep: boolean;
  };
};

export function StepForm({ scriptVersionId, stepId, defaults }: StepFormProps) {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(stepSchema),
    defaultValues: {
      scriptVersionId,
      name: defaults?.name || "",
      key: defaults?.key || "",
      metricKey: defaults?.metricKey || "",
      channel: defaults?.channel || StepChannel.EMAIL,
      subject: defaults?.subject || "",
      scriptText: defaults?.scriptText || "",
      instructions: defaults?.instructions || "",
      defaultDelayDays: defaults?.defaultDelayDays || 0,
      sortOrder: defaults?.sortOrder || 0,
      isStartStep: defaults?.isStartStep || false,
      isTerminalStep: defaults?.isTerminalStep || false,
      useCommonOutcomes: !stepId,
    },
  });
  const channel = useWatch({ control: form.control, name: "channel" });

  useEffect(() => {
    if (stepId) {
      return;
    }

    const defaultsForChannel = defaultStepContent(channel);
    if (!form.getValues("scriptText")) {
      form.setValue("scriptText", defaultsForChannel.scriptText);
    }
    if (!form.getValues("instructions")) {
      form.setValue("instructions", defaultsForChannel.instructions);
    }
    if (!form.getValues("subject") && defaultsForChannel.subject) {
      form.setValue("subject", defaultsForChannel.subject);
    }
  }, [channel, form, stepId]);

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = stepId
            ? await updateScriptStepAction(stepId, values)
            : await createScriptStepAction(values);
          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }
          toast.success(result.message || "Step saved");
          router.refresh();
        });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Step name" {...form.register("name")} />
        <Select {...form.register("channel")}>
          {Object.values(StepChannel).map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </Select>
        {channel === StepChannel.EMAIL ? (
          <Input placeholder="Subject line" {...form.register("subject")} />
        ) : null}
      </div>
      <Textarea placeholder="Script text" {...form.register("scriptText")} className="min-h-72" />
      <Textarea placeholder="Instructions" {...form.register("instructions")} />
      {!stepId ? (
        <label className="flex items-center gap-2 text-sm text-[var(--muted-strong)]">
          <input type="checkbox" {...form.register("useCommonOutcomes")} />
          Use common outcomes for this channel
        </label>
      ) : null}
      <details className="rounded-lg border bg-[var(--surface-subtle)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
          Advanced step settings
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input placeholder="Step key" {...form.register("key")} />
          <Input placeholder="Metric key" {...form.register("metricKey")} />
          <Input
            type="number"
            min={0}
            placeholder="Default delay days"
            {...form.register("defaultDelayDays")}
          />
          <Input
            type="number"
            min={0}
            placeholder="Sort order"
            {...form.register("sortOrder")}
          />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("isStartStep")} />
            Start step
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("isTerminalStep")} />
            Terminal step
          </label>
        </div>
      </details>
      <Button type="submit">{stepId ? "Update step" : "Create step"}</Button>
    </form>
  );
}
