"use server";

import { StepChannel } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getDefaultUser } from "@/lib/settings";
import { outcomeSchema, scriptSchema, stepSchema } from "@/lib/validations";
import {
  actionTypeToStatus,
  channelPresets,
  defaultMetricKeyForChannel,
  delayChoiceToConfig,
  generateKey,
  generateUniqueKey,
  inferStatusFromOutcomeKey,
  isTerminalAction,
  nextSortOrder,
} from "@/lib/workflow-defaults";

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

async function createPresetScriptStep(
  scriptVersionId: string,
  input: {
    name: string;
    channel: StepChannel;
    subject?: string;
    scriptText: string;
    instructions?: string;
    isStartStep?: boolean;
    outcomeNextStepKeys?: Record<string, string | undefined>;
  },
) {
  const existingSteps = await prisma.scriptStep.findMany({
    where: { scriptVersionId },
    select: { key: true, sortOrder: true },
  });

  const key = generateUniqueKey(
    generateKey(input.name),
    existingSteps.map((step) => step.key),
  );
  const step = await prisma.scriptStep.create({
    data: {
      scriptVersionId,
      name: input.name,
      key,
      metricKey: defaultMetricKeyForChannel(input.channel, input.name),
      channel: input.channel,
      subject: input.subject,
      scriptText: input.scriptText,
      instructions: input.instructions,
      sortOrder: nextSortOrder(existingSteps.map((step) => step.sortOrder)),
      isStartStep: input.isStartStep ?? existingSteps.length === 0,
    },
  });

  return step;
}

async function applySimpleEmailCallTemplate(scriptVersionId: string) {
  const initialEmail = await createPresetScriptStep(scriptVersionId, {
    name: "Initial Email",
    channel: StepChannel.EMAIL,
    subject: "Quick question",
    scriptText:
      "Hi {{contactName}},\n\nQuick question: are invoices still being created manually from your load documents?\n\n-Dejan from TruckA Company",
    instructions: "Keep the first email short. Ask for a reply.",
    isStartStep: true,
  });

  const phoneFollowUp = await createPresetScriptStep(scriptVersionId, {
    name: "Phone Follow-Up",
    channel: StepChannel.PHONE,
    scriptText:
      "Hi {{contactName}}, this is Dejan from TruckA Company. Quick question: is invoice creation still manual for your team?",
    instructions: "Keep the call focused on qualification and next step.",
  });

  const stepIdsByName = new Map([
    ["Initial Email", initialEmail.id],
    ["Phone Follow-Up", phoneFollowUp.id],
  ]);

  const emailPresets = channelPresets(StepChannel.EMAIL);
  for (const preset of emailPresets) {
    const key = generateKey(preset.label);
    const delayConfig = delayChoiceToConfig(preset.delayChoice as never);
    await prisma.scriptOutcome.create({
      data: {
        stepId: initialEmail.id,
        label: preset.label,
        key,
        metricKey: key,
        nextStepId:
          preset.actionType === "go_to_step" ? stepIdsByName.get("Phone Follow-Up") : null,
        delayDays: delayConfig.delayDays,
        setLeadStatus: preset.status,
        isTerminal: isTerminalAction(preset.actionType),
        requiresDateTime: preset.requiresDateTime ?? delayConfig.requiresDateTime,
        requiresContact: preset.requiresContact ?? false,
        sortOrder: nextSortOrder([]),
      },
    });
  }

  const phonePresets = channelPresets(StepChannel.PHONE);
  let sortOrder = 1;
  for (const preset of phonePresets) {
    const key = generateKey(preset.label);
    const delayConfig = delayChoiceToConfig(preset.delayChoice as never);
    await prisma.scriptOutcome.create({
      data: {
        stepId: phoneFollowUp.id,
        label: preset.label,
        key,
        metricKey: key,
        nextStepId: null,
        delayDays: delayConfig.delayDays,
        setLeadStatus: preset.status,
        isTerminal: isTerminalAction(preset.actionType),
        requiresDateTime: preset.requiresDateTime ?? delayConfig.requiresDateTime,
        requiresContact: preset.requiresContact ?? false,
        sortOrder: sortOrder++,
      },
    });
  }
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

  const versionId = script.versions[0]?.id;
  if (versionId && parsed.data.template === "simple_email_call") {
    await applySimpleEmailCallTemplate(versionId);
  } else if (versionId && parsed.data.template === "trucka_carrier_invoice_outreach") {
    await applySimpleEmailCallTemplate(versionId);
  }

  revalidatePath("/scripts");
  return {
    success: true,
    message: "Script created",
    error: undefined,
    scriptId: script.id,
    versionId,
    template: parsed.data.template,
  };
}

export async function createScriptStepAction(input: unknown) {
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid step.", message: undefined };
  }

  const existingSteps = await prisma.scriptStep.findMany({
    where: { scriptVersionId: parsed.data.scriptVersionId },
    select: { key: true, sortOrder: true, isStartStep: true },
  });

  const generatedKey = generateUniqueKey(
    generateKey(parsed.data.key || parsed.data.name),
    existingSteps.map((step) => step.key),
  );
  const isFirstStep = existingSteps.length === 0;
  const isStartStep =
    isFirstStep || parsed.data.isStartStep || !existingSteps.some((step) => step.isStartStep);

  if (isStartStep) {
    await prisma.scriptStep.updateMany({
      where: { scriptVersionId: parsed.data.scriptVersionId },
      data: { isStartStep: false },
    });
  }

  const createdStep = await prisma.scriptStep.create({
    data: {
      scriptVersionId: parsed.data.scriptVersionId,
      name: parsed.data.name,
      key: generatedKey,
      metricKey:
        parsed.data.metricKey || defaultMetricKeyForChannel(parsed.data.channel, parsed.data.name),
      channel: parsed.data.channel,
      subject: parsed.data.subject || null,
      scriptText: parsed.data.scriptText,
      instructions: parsed.data.instructions || null,
      defaultDelayDays: parsed.data.defaultDelayDays ?? 0,
      sortOrder: nextSortOrder(existingSteps.map((step) => step.sortOrder)),
      isStartStep,
      isTerminalStep: parsed.data.isTerminalStep,
    },
  });

  if (parsed.data.useCommonOutcomes) {
    const presets = channelPresets(parsed.data.channel);
    let sortOrder = 1;
    for (const preset of presets) {
      const key = generateKey(preset.label);
      const delayConfig = delayChoiceToConfig(preset.delayChoice as never);
      await prisma.scriptOutcome.create({
        data: {
          stepId: createdStep.id,
          label: preset.label,
          key,
          metricKey: key,
          nextStepId: null,
          delayDays: delayConfig.delayDays,
          setLeadStatus: preset.status,
          isTerminal: isTerminalAction(preset.actionType),
          requiresDateTime: preset.requiresDateTime ?? delayConfig.requiresDateTime,
          requiresContact: preset.requiresContact ?? false,
          sortOrder: sortOrder++,
        },
      });
    }
  }

  revalidatePath("/scripts");
  return {
    success: true,
    message: parsed.data.useCommonOutcomes
      ? "Step created with common outcomes"
      : "Step created. Now add outcomes for what can happen next.",
    error: undefined,
    stepId: createdStep.id,
  };
}

export async function updateScriptStepAction(
  stepId: string,
  input: unknown,
) {
  const parsed = stepSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid step.", message: undefined };
  }

  const existingSteps = await prisma.scriptStep.findMany({
    where: {
      scriptVersionId: parsed.data.scriptVersionId,
      NOT: { id: stepId },
    },
    select: { key: true, sortOrder: true, isStartStep: true },
  });

  const currentStep = await prisma.scriptStep.findUnique({ where: { id: stepId } });
  if (!currentStep) {
    return { success: false, error: "Step not found.", message: undefined };
  }

  const generatedKey = generateUniqueKey(
    generateKey(parsed.data.key || parsed.data.name),
    existingSteps.map((step) => step.key),
  );
  const isStartStep =
    parsed.data.isStartStep || (!existingSteps.some((step) => step.isStartStep) && !currentStep.isStartStep);

  if (isStartStep) {
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
      key: generatedKey,
      metricKey:
        parsed.data.metricKey || defaultMetricKeyForChannel(parsed.data.channel, parsed.data.name),
      channel: parsed.data.channel,
      subject: parsed.data.subject || null,
      scriptText: parsed.data.scriptText,
      instructions: parsed.data.instructions || null,
      defaultDelayDays: parsed.data.defaultDelayDays,
      sortOrder: currentStep.sortOrder,
      isStartStep: isStartStep || currentStep.isStartStep,
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

  const existingOutcomes = await prisma.scriptOutcome.findMany({
    where: { stepId: parsed.data.stepId },
    select: { key: true, sortOrder: true },
  });
  const generatedKey = generateUniqueKey(
    generateKey(parsed.data.key || parsed.data.label),
    existingOutcomes.map((outcome) => outcome.key),
  );
  const delayConfig = delayChoiceToConfig(
    parsed.data.delayChoice as never,
    parsed.data.delayDays,
  );
  const terminalStatus =
    parsed.data.setLeadStatus ??
    actionTypeToStatus(parsed.data.actionType || "") ??
    inferStatusFromOutcomeKey(generatedKey);
  const isTerminal =
    parsed.data.isTerminal || isTerminalAction(parsed.data.actionType || "");

  await prisma.scriptOutcome.create({
    data: {
      stepId: parsed.data.stepId,
      label: parsed.data.label,
      key: generatedKey,
      metricKey: parsed.data.metricKey || generatedKey,
      description: parsed.data.description || null,
      nextStepId:
        parsed.data.actionType === "go_to_step" ? parsed.data.nextStepId || null : null,
      delayDays: delayConfig.delayDays,
      setLeadStatus: terminalStatus,
      isTerminal,
      requiresNote: parsed.data.requiresNote,
      requiresDateTime: parsed.data.requiresDateTime || delayConfig.requiresDateTime,
      requiresContact: parsed.data.requiresContact,
      sortOrder: nextSortOrder(existingOutcomes.map((outcome) => outcome.sortOrder)),
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

  const currentOutcome = await prisma.scriptOutcome.findUnique({
    where: { id: outcomeId },
  });
  if (!currentOutcome) {
    return { success: false, error: "Outcome not found.", message: undefined };
  }
  const siblingOutcomes = await prisma.scriptOutcome.findMany({
    where: {
      stepId: parsed.data.stepId,
      NOT: { id: outcomeId },
    },
    select: { key: true },
  });
  const generatedKey = generateUniqueKey(
    generateKey(parsed.data.key || parsed.data.label),
    siblingOutcomes.map((outcome) => outcome.key),
  );
  const delayConfig = delayChoiceToConfig(
    parsed.data.delayChoice as never,
    parsed.data.delayDays,
  );
  const terminalStatus =
    parsed.data.setLeadStatus ??
    actionTypeToStatus(parsed.data.actionType || "") ??
    inferStatusFromOutcomeKey(generatedKey);
  const isTerminal =
    parsed.data.isTerminal || isTerminalAction(parsed.data.actionType || "");

  await prisma.scriptOutcome.update({
    where: { id: outcomeId },
    data: {
      label: parsed.data.label,
      key: generatedKey,
      metricKey: parsed.data.metricKey || generatedKey,
      description: parsed.data.description || null,
      nextStepId:
        parsed.data.actionType === "go_to_step" ? parsed.data.nextStepId || null : null,
      delayDays: delayConfig.delayDays,
      setLeadStatus: terminalStatus,
      isTerminal,
      requiresNote: parsed.data.requiresNote,
      requiresDateTime: parsed.data.requiresDateTime || delayConfig.requiresDateTime,
      requiresContact: parsed.data.requiresContact,
      sortOrder: currentOutcome.sortOrder,
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
