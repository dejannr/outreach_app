"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { createLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { leadSchema } from "@/lib/validations";

type LeadFormValues = z.input<typeof leadSchema>;

export function LeadForm() {
  const router = useRouter();
  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
      role: "",
      website: "",
      source: "",
      notes: "",
      tags: "",
    },
  });

  const onSubmit = (values: LeadFormValues, createAnother = false) => {
    startTransition(async () => {
      const result = await createLead(values);
      if (!result.success) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success(result.message || "Lead created");
      if (createAnother) {
        form.reset();
        router.refresh();
        return;
      }
      router.push(`/leads/${result.leadId}`);
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values))}
      className="space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Input placeholder="Company name" {...form.register("companyName")} />
        <Input placeholder="Contact name" {...form.register("contactName")} />
        <Input placeholder="Email" {...form.register("email")} />
        <Input placeholder="Phone" {...form.register("phone")} />
        <Input placeholder="Role" {...form.register("role")} />
      </div>
      <Textarea placeholder="Notes" {...form.register("notes")} />
      <details className="rounded-lg border bg-[var(--surface-subtle)] p-4">
        <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
          Optional fields
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Input placeholder="Website" {...form.register("website")} />
          <Input placeholder="Source" {...form.register("source")} />
          <Input placeholder="Tags (comma separated)" {...form.register("tags")} />
        </div>
      </details>
      {form.formState.errors.companyName ? (
        <p className="text-sm text-[var(--danger)]">
          {form.formState.errors.companyName.message}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit">Save lead</Button>
        <Button
          type="button"
          variant="secondary"
          onClick={form.handleSubmit((values) => onSubmit(values, true))}
        >
          Create another lead
        </Button>
      </div>
    </form>
  );
}
