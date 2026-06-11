"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/settings";
import { outcomeSchema, scriptSchema, stepSchema } from "@/lib/validations";

async function cloneVersion(versionId: string) {
  const version = await prisma.scriptVersion.findUnique({
    where: { id: versionId },
    include: {
      script: true,
      steps: {
        include: {
          outcomesFrom: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!version) {
    throw new Error("Script version not found.");
  }

  const newVersion = await prisma.scriptVersion.create({
    data: {
      scriptId: version.scriptId,
      version: version.version + 1,
      name: `${version.script.name} v${version.version + 1}`,
      description: version.description,
      isActive: false,
    },
  });

  const stepMap = new Map<string, string>();

  for (const step of version.steps) {
    const createdStep = await prisma.scriptStep.create({
      data: {
        scriptVersionId: newVersion.id,
        key: step.key,
        metricKey: step.metricKey,
        name: step.name,
        channel: step.channel,
        subject: step.subject,
        scriptText: step.scriptText,
        instructions: step.instructions,
        sortOrder: step.sortOrder,
        isStartStep: step.isStartStep,
        isTerminalStep: step.isTerminalStep,
        defaultDelayDays: step.defaultDelayDays,
        isArchived: step.isArchived,
        positionX: step.positionX,
        positionY: step.positionY,
      },
    });

    stepMap.set(step.id, createdStep.id);
  }

  for (const step of version.steps) {
    for (const outcome of step.outcomesFrom) {
      await prisma.scriptOutcome.create({
        data: {
          stepId: stepMap.get(step.id)!,
          label: outcome.label,
          key: outcome.key,
          metricKey: outcome.metricKey,
          description: outcome.description,
          nextStepId: outcome.nextStepId ? stepMap.get(outcome.nextStepId) : undefined,
          delayDays: outcome.delayDays,
          setLeadStatus: outcome.setLeadStatus,
          isTerminal: outcome.isTerminal,
          isArchived: outcome.isArchived,
          requiresNote: outcome.requiresNote,
          requiresDateTime: outcome.requiresDateTime,
          requiresContact: outcome.requiresContact,
          sortOrder: outcome.sortOrder,
          metadata: outcome.metadata ?? undefined,
        },
      });
    }
  }

  return newVersion;
}

export async function createScriptAction(input: unknown) {
  const parsed = scriptSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid script.", message: undefined };
  }

  const user = await getDefaultUser();

  const script = await prisma.script.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description || null,
      createdById: user?.id,
      versions: {
        create: {
          version: 1,
          name: `${parsed.data.name} v1`,
          description: parsed.data.description || null,
        },
      },
    },
    include: {
      versions: true,
    },
  });

  revalidatePath("/scripts");
  return {
    success: true,
    message: "Script created",
    error: undefined,
    scriptId: script.id,
    versionId: script.versions[0]?.id,
  };
}

export async function createScriptStepAction(input: unknown) {
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid step.", message: undefined };
  }

  if (parsed.data.isStartStep) {
    await prisma.scriptStep.updateMany({
      where: { scriptVersionId: parsed.data.scriptVersionId },
      data: { isStartStep: false },
    });
  }

  await prisma.scriptStep.create({
    data: {
      scriptVersionId: parsed.data.scriptVersionId,
      name: parsed.data.name,
      key: parsed.data.key,
      metricKey: parsed.data.metricKey,
      channel: parsed.data.channel,
      subject: parsed.data.subject || null,
      scriptText: parsed.data.scriptText,
      instructions: parsed.data.instructions || null,
      defaultDelayDays: parsed.data.defaultDelayDays,
      sortOrder: parsed.data.sortOrder,
      isStartStep: parsed.data.isStartStep,
      isTerminalStep: parsed.data.isTerminalStep,
    },
  });

  revalidatePath("/scripts");
  return { success: true, message: "Step created", error: undefined };
}

export async function updateScriptStepAction(
  stepId: string,
  input: unknown,
) {
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid step.", message: undefined };
  }

  if (parsed.data.isStartStep) {
    await prisma.scriptStep.updateMany({
      where: {
        scriptVersionId: parsed.data.scriptVersionId,
        NOT: { id: stepId },
      },
      data: { isStartStep: false },
    });
  }

  await prisma.scriptStep.update({
    where: { id: stepId },
    data: {
      name: parsed.data.name,
      key: parsed.data.key,
      metricKey: parsed.data.metricKey,
      channel: parsed.data.channel,
      subject: parsed.data.subject || null,
      scriptText: parsed.data.scriptText,
      instructions: parsed.data.instructions || null,
      defaultDelayDays: parsed.data.defaultDelayDays,
      sortOrder: parsed.data.sortOrder,
      isStartStep: parsed.data.isStartStep,
      isTerminalStep: parsed.data.isTerminalStep,
    },
  });

  revalidatePath("/scripts");
  return { success: true, message: "Step updated", error: undefined };
}

export async function createScriptOutcomeAction(input: unknown) {
  const parsed = outcomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid outcome.", message: undefined };
  }

  await prisma.scriptOutcome.create({
    data: {
      stepId: parsed.data.stepId,
      label: parsed.data.label,
      key: parsed.data.key,
      metricKey: parsed.data.metricKey,
      description: parsed.data.description || null,
      nextStepId: parsed.data.nextStepId || null,
      delayDays: parsed.data.delayDays,
      setLeadStatus: parsed.data.setLeadStatus,
      isTerminal: parsed.data.isTerminal,
      requiresNote: parsed.data.requiresNote,
      requiresDateTime: parsed.data.requiresDateTime,
      requiresContact: parsed.data.requiresContact,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/scripts");
  return { success: true, message: "Outcome created", error: undefined };
}

export async function updateScriptOutcomeAction(
  outcomeId: string,
  input: unknown,
) {
  const parsed = outcomeSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid outcome.", message: undefined };
  }

  await prisma.scriptOutcome.update({
    where: { id: outcomeId },
    data: {
      label: parsed.data.label,
      key: parsed.data.key,
      metricKey: parsed.data.metricKey,
      description: parsed.data.description || null,
      nextStepId: parsed.data.nextStepId || null,
      delayDays: parsed.data.delayDays,
      setLeadStatus: parsed.data.setLeadStatus,
      isTerminal: parsed.data.isTerminal,
      requiresNote: parsed.data.requiresNote,
      requiresDateTime: parsed.data.requiresDateTime,
      requiresContact: parsed.data.requiresContact,
      sortOrder: parsed.data.sortOrder,
    },
  });

  revalidatePath("/scripts");
  return { success: true, message: "Outcome updated", error: undefined };
}

export async function setActiveScriptVersionAction(versionId: string) {
  const version = await prisma.scriptVersion.findUnique({
    where: { id: versionId },
  });

  if (!version) {
    return { success: false, error: "Version not found.", message: undefined };
  }

  await prisma.scriptVersion.updateMany({
    where: { scriptId: version.scriptId },
    data: { isActive: false },
  });

  await prisma.scriptVersion.update({
    where: { id: versionId },
    data: { isActive: true },
  });

  await prisma.appSetting.upsert({
    where: { key: "activeScriptVersionId" },
    update: { value: versionId },
    create: { key: "activeScriptVersionId", value: versionId },
  });

  revalidatePath("/scripts");
  revalidatePath("/settings");
  return { success: true, message: "Script set active", error: undefined };
}

export async function createScriptVersionAction(versionId: string) {
  const newVersion = await cloneVersion(versionId);
  revalidatePath("/scripts");
  return {
    success: true,
    message: "New version created",
    error: undefined,
    versionId: newVersion.id,
  };
}
