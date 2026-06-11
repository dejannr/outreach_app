"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { createScriptAction } from "@/app/actions/scripts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { scriptSchema } from "@/lib/validations";

type ScriptValues = z.input<typeof scriptSchema>;

export function ScriptForm() {
  const router = useRouter();
  const form = useForm<ScriptValues>({
    resolver: zodResolver(scriptSchema),
    defaultValues: {
      name: "",
      description: "",
      template: "blank",
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createScriptAction(values);
          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success(result.message || "Script created");
          if (result.template === "blank" && result.versionId) {
            router.push(
              `/scripts/${result.scriptId}/steps/new?versionId=${result.versionId}`,
            );
          } else {
            router.push(`/scripts/${result.scriptId}`);
          }
          router.refresh();
        });
      })}
    >
      <Input placeholder="Script name" {...form.register("name")} />
      <Textarea placeholder="Description" {...form.register("description")} />
      <Select {...form.register("template")}>
        <option value="blank">Blank Script</option>
        <option value="trucka_carrier_invoice_outreach">
          TruckA Carrier Invoice Outreach
        </option>
        <option value="simple_email_call">Simple Email + Call Sequence</option>
      </Select>
      <Button type="submit">Create script</Button>
    </form>
  );
}
