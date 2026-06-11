"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { createLead } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function QuickLeadForm() {
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      companyName: "",
      contactName: "",
      email: "",
      phone: "",
    },
  });

  return (
    <form
      className="grid gap-3 md:grid-cols-5"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await createLead(values);
          if (!result.success || !result.leadId) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success("Lead created");
          form.reset();
          router.refresh();
        });
      })}
    >
      <Input placeholder="Company" {...form.register("companyName")} />
      <Input placeholder="Contact" {...form.register("contactName")} />
      <Input placeholder="Email" {...form.register("email")} />
      <Input placeholder="Phone" {...form.register("phone")} />
      <Button type="submit">Create Lead</Button>
      <div className="md:col-span-5 text-xs text-[var(--muted)]">
        Create a lead quickly here, or use the full lead form for notes and optional fields.
      </div>
    </form>
  );
}
