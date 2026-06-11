"use server";

import { LeadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { getDefaultUser } from "@/lib/settings";
import { completeTaskSchema, customOutcomeSchema } from "@/lib/validations";
import {
  completeTaskWithCustomOutcome,
  completeTaskWithOutcome,
} from "@/lib/workflow";

export async function completeTaskAction(input: unknown) {
  const parsed = completeTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid task completion.", message: undefined };
  }

  const user = await getDefaultUser();

  await completeTaskWithOutcome({
    taskId: parsed.data.taskId,
    outcomeId: parsed.data.outcomeId,
    userId: user?.id,
    note: parsed.data.note || undefined,
    scheduledAt: parsed.data.scheduledAt
      ? new Date(parsed.data.scheduledAt)
      : undefined,
    contact:
      parsed.data.contactName ||
      parsed.data.contactEmail ||
      parsed.data.contactPhone ||
      parsed.data.contactRole
        ? {
            name: parsed.data.contactName || undefined,
            email: parsed.data.contactEmail || undefined,
            phone: parsed.data.contactPhone || undefined,
            role: parsed.data.contactRole || undefined,
          }
        : undefined,
  });

  revalidatePath("/start-working");
  revalidatePath("/leads");
  return { success: true, message: "Task completed", error: undefined };
}

export async function completeCustomOutcomeAction(input: unknown) {
  const parsed = customOutcomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid custom outcome.", message: undefined };
  }

  const user = await getDefaultUser();

  await completeTaskWithCustomOutcome({
    taskId: parsed.data.taskId,
    userId: user?.id,
    explanation: parsed.data.explanation,
    existingStepId: parsed.data.existingStepId || undefined,
    migrateToScriptVersionId: parsed.data.migrateToScriptVersionId || undefined,
    terminalStatus: parsed.data.terminalStatus as LeadStatus | undefined,
    manualTask:
      parsed.data.manualTitle && parsed.data.manualDueAt
        ? {
            title: parsed.data.manualTitle,
            dueAt: new Date(parsed.data.manualDueAt),
          }
        : undefined,
  });

  revalidatePath("/start-working");
  revalidatePath("/leads");
  return { success: true, message: "Custom outcome recorded", error: undefined };
}
