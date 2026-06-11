"use client";

import { startTransition } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { updateSettingsAction } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const dayOptions = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export function SettingsForm({
  settings,
  versions,
}: {
  settings: {
    activeScriptVersionId: string;
    dailyNewLeadLimit: number;
    userName: string;
    companyName: string;
    defaultTimezone: string;
    workingDays: string[];
  };
  versions: { id: string; name: string }[];
}) {
  const form = useForm({
    defaultValues: {
      activeScriptVersionId: settings.activeScriptVersionId,
      dailyNewLeadLimit: settings.dailyNewLeadLimit,
      userName: settings.userName,
      companyName: settings.companyName,
      defaultTimezone: settings.defaultTimezone,
      workingDays: settings.workingDays,
    },
  });
  const workingDays = useWatch({
    control: form.control,
    name: "workingDays",
  }) || [];

  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit((values) => {
        startTransition(async () => {
          const result = await updateSettingsAction({
            ...values,
            dailyNewLeadLimit: Number(values.dailyNewLeadLimit),
            workingDays: values.workingDays,
          });

          if (!result.success) {
            toast.error(result.error || "Something went wrong");
            return;
          }

          toast.success(result.message || "Settings saved");
        });
      })}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Select {...form.register("activeScriptVersionId")}>
          {versions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </Select>
        <Input
          type="number"
          min={1}
          max={100}
          {...form.register("dailyNewLeadLimit")}
        />
        <Input placeholder="User name" {...form.register("userName")} />
        <Input placeholder="Company name" {...form.register("companyName")} />
        <Input placeholder="Timezone" {...form.register("defaultTimezone")} />
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold">Working days</p>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map((day) => {
            const checked = workingDays.includes(day);
            return (
              <label
                key={day}
                className="flex items-center gap-2 rounded-full border bg-white px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(event) => {
                    const next = event.target.checked
                      ? [...workingDays, day]
                      : workingDays.filter((item) => item !== day);
                    form.setValue("workingDays", next);
                  }}
                />
                {day}
              </label>
            );
          })}
        </div>
      </div>
      <Button type="submit">Save settings</Button>
    </form>
  );
}
