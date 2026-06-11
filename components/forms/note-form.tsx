"use client";

import { startTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { addNoteAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteForm({ leadId }: { leadId: string }) {
  const form = useForm({
    defaultValues: {
      body: "",
    },
  });

  return (
    <form
      className="space-y-3 rounded-2xl border bg-white p-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await addNoteAction({ leadId, body: values.body });
          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success(result.message || "Note added");
          form.reset();
        });
      })}
    >
      <Textarea placeholder="Add a note" {...form.register("body")} />
      <Button type="submit" size="sm" variant="secondary">
        Add note
      </Button>
    </form>
  );
}
