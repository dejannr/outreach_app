"use client";

import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createManualTaskAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function ManualTaskForm({
  leadId,
  steps,
}: {
  leadId: string;
  steps: { id: string; name: string }[];
}) {
  const form = useForm({
    defaultValues: {
      title: "",
      dueAt: "",
      stepId: "",
      description: "",
    },
  });

  return (
    <form
      className="space-y-3 rounded-2xl border bg-white p-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createManualTaskAction({
            leadId,
            title: values.title,
            dueAt: values.dueAt,
            stepId: values.stepId,
            description: values.description,
          });

          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success(result.message || "Manual task created");
          form.reset();
        });
      })}
    >
      <Input placeholder="Task title" {...form.register("title")} />
      <div className="grid gap-3 md:grid-cols-2">
        <Input type="datetime-local" {...form.register("dueAt")} />
        <Select {...form.register("stepId")}>
          <option value="">No linked step</option>
          {steps.map((step) => (
            <option key={step.id} value={step.id}>
              {step.name}
            </option>
          ))}
        </Select>
      </div>
      <Textarea placeholder="Description" {...form.register("description")} />
      <Button type="submit" size="sm">
        Create manual task
      </Button>
    </form>
  );
}
