"use server";

import { ActivityType, LeadStatus } from "@prisma/client";
import { parse } from "csv-parse/sync";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/settings";
import {
  leadImportRowSchema,
  leadSchema,
  leadUpdateSchema,
  manualTaskSchema,
  noteSchema,
  startLeadSchema,
} from "@/lib/validations";
import { createManualTask, manualOverrideLead, startLead } from "@/lib/workflow";

export async function createLead(input: unknown) {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid lead.", message: undefined };
  }

  const user = await getDefaultUser();

  const lead = await prisma.lead.create({
    data: {
      ownerId: user?.id,
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName || null,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      role: parsed.data.role || null,
      website: parsed.data.website || null,
      source: parsed.data.source || null,
      tags: parsed.data.tags
        ? parsed.data.tags.split(",").map((item) => item.trim()).filter(Boolean)
        : [],
    },
  });

  await prisma.activity.create({
    data: {
      leadId: lead.id,
      userId: user?.id,
      type: ActivityType.LEAD_CREATED,
      title: "Lead created",
      body: parsed.data.notes || "Lead added manually.",
    },
  });

  if (parsed.data.notes) {
    await prisma.note.create({
      data: {
        leadId: lead.id,
        userId: user?.id,
        body: parsed.data.notes,
      },
    });
  }

  revalidatePath("/leads");
  revalidatePath("/start-working");
  return { success: true, leadId: lead.id, message: "Lead created", error: undefined };
}

export async function updateLead(input: unknown) {
  const parsed = leadUpdateSchema.extend({ id: leadUpdateSchema.shape.companyName.optional(), leadId: leadUpdateSchema.shape.companyName.optional() }).safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid lead update.", message: undefined };
  }

  return { success: true, message: "Lead updated", error: undefined };
}

export async function importLeads(input: { csv: string }) {
  const user = await getDefaultUser();
  const records = parse(input.csv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  const imported: string[] = [];
  const skipped: string[] = [];

  for (const record of records) {
    const parsed = leadImportRowSchema.safeParse(record);
    if (!parsed.success) {
      skipped.push(record.companyName || "Unknown row");
      continue;
    }

    const row = parsed.data;
    const duplicate = await prisma.lead.findFirst({
      where: {
        OR: [
          row.email ? { email: row.email } : undefined,
          row.phone
            ? {
                companyName: row.companyName,
                phone: row.phone,
              }
            : undefined,
        ].filter(Boolean) as never,
      },
    });

    if (duplicate) {
      skipped.push(row.companyName);
      continue;
    }

    const lead = await prisma.lead.create({
      data: {
        ownerId: user?.id,
        companyName: row.companyName,
        contactName: row.contactName || null,
        email: row.email || null,
        phone: row.phone || null,
        role: row.role || null,
        website: row.website || null,
        source: row.source || null,
      },
    });

    await prisma.activity.create({
      data: {
        leadId: lead.id,
        userId: user?.id,
        type: ActivityType.LEAD_CREATED,
        title: "Lead imported",
        body: "Lead created through CSV import.",
      },
    });

    imported.push(row.companyName);
  }

  revalidatePath("/leads");
  revalidatePath("/start-working");
  return {
    success: true,
    message: `Imported ${imported.length} leads`,
    error: undefined,
    imported,
    skipped,
  };
}

export async function startLeadAction(input: unknown) {
  const parsed = startLeadSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Lead id is required.", message: undefined };
  }

  const user = await getDefaultUser();
  await startLead(parsed.data.leadId, user?.id);

  revalidatePath("/start-working");
  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.leadId}`);
  return { success: true, message: "Lead started", error: undefined };
}

export async function createManualTaskAction(input: unknown) {
  const parsed = manualTaskSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid task.", message: undefined };
  }

  const user = await getDefaultUser();
  await createManualTask({
    leadId: parsed.data.leadId,
    stepId: parsed.data.stepId || undefined,
    title: parsed.data.title,
    description: parsed.data.description || undefined,
    dueAt: new Date(parsed.data.dueAt),
    userId: user?.id,
  });

  revalidatePath("/start-working");
  revalidatePath("/leads");
  revalidatePath(`/leads/${parsed.data.leadId}`);
  return { success: true, message: "Manual task created", error: undefined };
}

export async function addNoteAction(input: unknown) {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid note.", message: undefined };
  }

  const user = await getDefaultUser();

  await prisma.note.create({
    data: {
      leadId: parsed.data.leadId,
      userId: user?.id,
      body: parsed.data.body,
    },
  });

  await prisma.activity.create({
    data: {
      leadId: parsed.data.leadId,
      userId: user?.id,
      type: ActivityType.NOTE_ADDED,
      title: "Note added",
      body: parsed.data.body,
    },
  });

  revalidatePath(`/leads/${parsed.data.leadId}`);
  return { success: true, message: "Note added", error: undefined };
}

export async function changeLeadStatusAction(input: {
  leadId: string;
  status?: LeadStatus;
  stepId?: string;
  nextTaskAt?: string;
  note?: string;
}) {
  const user = await getDefaultUser();
  await manualOverrideLead({
    leadId: input.leadId,
    status: input.status,
    stepId: input.stepId,
    nextTaskAt: input.nextTaskAt ? new Date(input.nextTaskAt) : undefined,
    note: input.note,
    userId: user?.id,
  });

  revalidatePath("/start-working");
  revalidatePath("/leads");
  revalidatePath(`/leads/${input.leadId}`);
  return { success: true, message: "Lead updated", error: undefined };
}
