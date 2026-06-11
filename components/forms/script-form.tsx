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
          router.push(`/scripts/${result.scriptId}`);
          router.refresh();
        });
      })}
    >
      <Input placeholder="Script name" {...form.register("name")} />
      <Textarea placeholder="Description" {...form.register("description")} />
      <Button type="submit">Create script</Button>
    </form>
  );
}
