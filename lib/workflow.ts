import {
  ActivityType,
  JourneyEventType,
  LeadStatus,
  Prisma,
  StepChannel,
  TaskPriority,
  TaskStatus,
  type ScriptOutcome,
  type ScriptStep,
} from "@prisma/client";
import { addDays } from "date-fns";

import {
  APP_SETTING_KEYS,
  HIGH_VALUE_CHANNELS,
  STEP_CHANNEL_LABELS,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Tx = Prisma.TransactionClient;

function getTaskPriority(channel?: StepChannel, dueAt?: Date) {
  const isHighValue = channel ? HIGH_VALUE_CHANNELS.includes(channel) : false;
  const isOverdue = dueAt ? dueAt < new Date() : false;

  if (isHighValue && isOverdue) {
    return TaskPriority.URGENT;
  }

  if (isHighValue) {
    return TaskPriority.HIGH;
  }

  return TaskPriority.NORMAL;
}

function buildTaskTitle(step: ScriptStep, lead?: { contactName?: string | null }) {
  switch (step.channel) {
    case StepChannel.EMAIL:
      return `Send ${step.name}`;
    case StepChannel.PHONE:
      return `Call ${lead?.contactName?.trim() || step.name}`;
    case StepChannel.DEMO:
      return "Run Demo";
    case StepChannel.DOCUMENT_REQUEST:
      return "Request Documents";
    case StepChannel.LOOM:
      return "Send Loom Follow-Up";
    case StepChannel.CLOSE:
      return `Close: ${step.name}`;
    case StepChannel.BREAKUP:
      return `Send ${step.name}`;
    default:
      return `${STEP_CHANNEL_LABELS[step.channel]}: ${step.name}`;
  }
}

function buildStepSnapshot(step?: ScriptStep | null) {
  if (!step) {
    return {};
  }

  return {
    stepIdSnapshot: step.id,
    stepKey: step.key,
    stepMetricKey: step.metricKey,
    stepNameSnapshot: step.name,
  };
}

function buildOutcomeSnapshot(outcome?: ScriptOutcome | null) {
  if (!outcome) {
    return {};
  }

  return {
    outcomeIdSnapshot: outcome.id,
    outcomeKey: outcome.key,
    outcomeMetricKey: outcome.metricKey,
    outcomeLabelSnapshot: outcome.label,
  };
}

async function getActiveScriptVersionId(tx: Tx) {
  const setting = await tx.appSetting.findUnique({
    where: { key: APP_SETTING_KEYS.ACTIVE_SCRIPT_VERSION_ID },
  });

  const value = setting?.value;
  if (typeof value !== "string" || !value) {
    throw new Error("Active script version is not configured.");
  }

  return value;
}

async function createTaskForStep(
  tx: Tx,
  input: {
    leadId: string;
    userId?: string;
    step: ScriptStep;
    dueAt: Date;
    description?: string | null;
    leadContactName?: string | null;
  },
) {
  const task = await tx.task.create({
    data: {
      leadId: input.leadId,
      userId: input.userId,
      stepId: input.step.id,
      title: buildTaskTitle(input.step, { contactName: input.leadContactName }),
      description: input.description ?? input.step.instructions,
      dueAt: input.dueAt,
      priority: getTaskPriority(input.step.channel, input.dueAt),
    },
  });

  return task;
}

async function createActivityAndJourneyEvent(
  tx: Tx,
  input: {
    leadId: string;
    userId?: string;
    type: ActivityType;
    journeyType?: JourneyEventType;
    title: string;
    body?: string | null;
    metadata?: Prisma.InputJsonValue;
    step?: ScriptStep | null;
    outcome?: ScriptOutcome | null;
    scriptVersionId?: string | null;
    scriptVersionNumber?: number | null;
    leadStatus?: LeadStatus | null;
  },
) {
  await tx.activity.create({
    data: {
      leadId: input.leadId,
      userId: input.userId,
      type: input.type,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
    },
  });

  if (!input.journeyType) {
    return;
  }

  await tx.journeyEvent.create({
    data: {
      leadId: input.leadId,
      userId: input.userId,
      type: input.journeyType,
      title: input.title,
      body: input.body,
      metadata: input.metadata,
      scriptVersionIdSnapshot: input.scriptVersionId,
      scriptVersionNumberSnapshot: input.scriptVersionNumber,
      leadStatusSnapshot: input.leadStatus ?? undefined,
      ...buildStepSnapshot(input.step),
      ...buildOutcomeSnapshot(input.outcome),
    },
  });
}

export async function startLead(leadId: string, userId?: string) {
  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({
      where: { id: leadId },
    });

    if (!lead) {
      throw new Error("Lead not found.");
    }

    const activeScriptVersionId = await getActiveScriptVersionId(tx);

    const scriptVersion = await tx.scriptVersion.findUnique({
      where: { id: activeScriptVersionId },
      include: {
        steps: {
          where: { isStartStep: true, isArchived: false },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const startStep = scriptVersion?.steps[0];

    if (!scriptVersion || !startStep) {
      throw new Error("Active script version does not have a start step.");
    }

    const now = new Date();

    await tx.lead.update({
      where: { id: leadId },
      data: {
        scriptVersionId: scriptVersion.id,
        status: LeadStatus.ACTIVE,
        startedAt: lead.startedAt ?? now,
        currentStepId: startStep.id,
        nextTaskAt: now,
      },
    });

    await createTaskForStep(tx, {
      leadId,
      userId,
      step: startStep,
      dueAt: now,
      leadContactName: lead.contactName,
    });

    await createActivityAndJourneyEvent(tx, {
      leadId,
      userId,
      type: ActivityType.LEAD_STARTED,
      journeyType: JourneyEventType.LEAD_STARTED,
      title: "Lead started script",
      body: `${lead.companyName} entered ${scriptVersion.name}.`,
      step: startStep,
      scriptVersionId: scriptVersion.id,
      scriptVersionNumber: scriptVersion.version,
      leadStatus: LeadStatus.ACTIVE,
    });

    await createActivityAndJourneyEvent(tx, {
      leadId,
      userId,
      type: ActivityType.TASK_CREATED,
      journeyType: JourneyEventType.TASK_CREATED,
      title: `Task created: ${startStep.name}`,
      body: "The first outreach task is ready.",
      step: startStep,
      scriptVersionId: scriptVersion.id,
      scriptVersionNumber: scriptVersion.version,
      leadStatus: LeadStatus.ACTIVE,
    });
  });
}

export async function completeTaskWithOutcome(input: {
  taskId: string;
  outcomeId: string;
  userId?: string;
  note?: string;
  scheduledAt?: Date;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
  };
}) {
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: input.taskId },
      include: {
        lead: {
          include: {
            scriptVersion: true,
          },
        },
        step: true,
      },
    });

    if (!task || !task.step) {
      throw new Error("Task not found.");
    }

    if (task.status !== TaskStatus.OPEN) {
      throw new Error("Task is already completed.");
    }

    const outcome = await tx.scriptOutcome.findUnique({
      where: { id: input.outcomeId },
      include: {
        nextStep: true,
      },
    });

    if (!outcome) {
      throw new Error("Outcome not found.");
    }

    const now = new Date();

    await tx.task.update({
      where: { id: task.id },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: now,
        completedOutcomeId: outcome.id,
        completedNote: input.note,
      },
    });

    if (input.contact && Object.values(input.contact).some(Boolean)) {
      await tx.lead.update({
        where: { id: task.leadId },
        data: {
          contactName: input.contact.name || undefined,
          email: input.contact.email || undefined,
          phone: input.contact.phone || undefined,
          role: input.contact.role || undefined,
        },
      });
    }

    await createActivityAndJourneyEvent(tx, {
      leadId: task.leadId,
      userId: input.userId,
      type: ActivityType.TASK_COMPLETED,
      journeyType: JourneyEventType.TASK_COMPLETED,
      title: `Task completed: ${task.title}`,
      body: input.note || `Completed with outcome: ${outcome.label}`,
      step: task.step,
      outcome,
      scriptVersionId: task.lead.scriptVersionId,
      scriptVersionNumber: task.lead.scriptVersion?.version,
      leadStatus: outcome.setLeadStatus ?? task.lead.status,
    });

    await createActivityAndJourneyEvent(tx, {
      leadId: task.leadId,
      userId: input.userId,
      type: ActivityType.OUTCOME_SELECTED,
      journeyType: JourneyEventType.OUTCOME_SELECTED,
      title: `Outcome selected: ${outcome.label}`,
      body: input.note,
      metadata: input.contact ? (input.contact as Prisma.InputJsonValue) : undefined,
      step: task.step,
      outcome,
      scriptVersionId: task.lead.scriptVersionId,
      scriptVersionNumber: task.lead.scriptVersion?.version,
      leadStatus: outcome.setLeadStatus ?? task.lead.status,
    });

    const nextStatus = outcome.setLeadStatus ?? task.lead.status;

    if (outcome.isTerminal || !outcome.nextStepId) {
      await tx.lead.update({
        where: { id: task.leadId },
        data: {
          status: nextStatus,
          lastContactedAt: now,
          nextTaskAt: null,
          completedAt:
            nextStatus === LeadStatus.ACTIVE || nextStatus === LeadStatus.WAITING
              ? null
              : now,
        },
      });

      const terminalType =
        nextStatus === LeadStatus.CLOSED_WON
          ? JourneyEventType.CLOSED_WON
          : nextStatus === LeadStatus.CLOSED_LOST
            ? JourneyEventType.CLOSED_LOST
            : nextStatus === LeadStatus.DISQUALIFIED
              ? JourneyEventType.DISQUALIFIED
              : JourneyEventType.TERMINAL_REACHED;

      await createActivityAndJourneyEvent(tx, {
        leadId: task.leadId,
        userId: input.userId,
        type: ActivityType.STATUS_CHANGED,
        journeyType: terminalType,
        title: `Lead marked as ${nextStatus.replaceAll("_", " ").toLowerCase()}`,
        body: "No next task scheduled.",
        step: task.step,
        outcome,
        scriptVersionId: task.lead.scriptVersionId,
        scriptVersionNumber: task.lead.scriptVersion?.version,
        leadStatus: nextStatus,
      });

      return;
    }

    const nextStep = outcome.nextStep;

    if (!nextStep) {
      throw new Error("Next step is missing.");
    }

    const dueAt = input.scheduledAt ?? addDays(now, outcome.delayDays);

    await tx.lead.update({
      where: { id: task.leadId },
      data: {
        status: nextStatus,
        currentStepId: nextStep.id,
        nextTaskAt: dueAt,
        lastContactedAt: now,
        completedAt: null,
      },
    });

    await createTaskForStep(tx, {
      leadId: task.leadId,
      userId: input.userId,
      step: nextStep,
      dueAt,
      leadContactName: task.lead.contactName,
    });

    await createActivityAndJourneyEvent(tx, {
      leadId: task.leadId,
      userId: input.userId,
      type: ActivityType.TASK_CREATED,
      journeyType: JourneyEventType.NEXT_STEP_SCHEDULED,
      title: `Next step scheduled: ${nextStep.name}`,
      body: `Due on ${dueAt.toISOString()}.`,
      step: nextStep,
      outcome,
      scriptVersionId: task.lead.scriptVersionId,
      scriptVersionNumber: task.lead.scriptVersion?.version,
      leadStatus: nextStatus,
    });
  });
}

export async function createManualTask(input: {
  leadId: string;
  stepId?: string;
  title: string;
  dueAt: Date;
  description?: string;
  userId?: string;
}) {
  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({
      where: { id: input.leadId },
      include: { scriptVersion: true },
    });

    if (!lead) {
      throw new Error("Lead not found.");
    }

    const step = input.stepId
      ? await tx.scriptStep.findUnique({ where: { id: input.stepId } })
      : null;

    await tx.task.create({
      data: {
        leadId: input.leadId,
        userId: input.userId,
        stepId: step?.id,
        title: input.title,
        description: input.description,
        dueAt: input.dueAt,
        priority: getTaskPriority(step?.channel, input.dueAt),
      },
    });

    await tx.lead.update({
      where: { id: input.leadId },
      data: {
        currentStepId: step?.id ?? lead.currentStepId,
        nextTaskAt: input.dueAt,
      },
    });

    await createActivityAndJourneyEvent(tx, {
      leadId: input.leadId,
      userId: input.userId,
      type: ActivityType.MANUAL_OVERRIDE,
      journeyType: JourneyEventType.MANUAL_OVERRIDE,
      title: `Manual task created: ${input.title}`,
      body: input.description,
      step,
      scriptVersionId: lead.scriptVersionId,
      scriptVersionNumber: lead.scriptVersion?.version,
      leadStatus: lead.status,
    });
  });
}

export async function manualOverrideLead(input: {
  leadId: string;
  status?: LeadStatus;
  stepId?: string;
  nextTaskAt?: Date;
  note?: string;
  userId?: string;
}) {
  await prisma.$transaction(async (tx) => {
    const lead = await tx.lead.findUnique({
      where: { id: input.leadId },
      include: { scriptVersion: true },
    });

    if (!lead) {
      throw new Error("Lead not found.");
    }

    const step = input.stepId
      ? await tx.scriptStep.findUnique({ where: { id: input.stepId } })
      : null;

    const isTerminalStatus =
      input.status === LeadStatus.CLOSED_WON ||
      input.status === LeadStatus.CLOSED_LOST ||
      input.status === LeadStatus.DISQUALIFIED ||
      input.status === LeadStatus.NOT_INTERESTED;

    await tx.lead.update({
      where: { id: input.leadId },
      data: {
        status: input.status ?? lead.status,
        currentStepId: input.stepId ?? lead.currentStepId,
        nextTaskAt: input.nextTaskAt ?? lead.nextTaskAt,
        completedAt: isTerminalStatus ? new Date() : lead.completedAt,
      },
    });

    await createActivityAndJourneyEvent(tx, {
      leadId: input.leadId,
      userId: input.userId,
      type: ActivityType.MANUAL_OVERRIDE,
      journeyType: JourneyEventType.MANUAL_OVERRIDE,
      title: "Lead manually overridden",
      body: input.note,
      step,
      scriptVersionId: lead.scriptVersionId,
      scriptVersionNumber: lead.scriptVersion?.version,
      leadStatus: input.status ?? lead.status,
    });
  });
}

export async function completeTaskWithCustomOutcome(input: {
  taskId: string;
  userId?: string;
  explanation: string;
  manualTask?: {
    title: string;
    dueAt: Date;
  };
  existingStepId?: string;
  terminalStatus?: LeadStatus;
  migrateToScriptVersionId?: string;
}) {
  await prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({
      where: { id: input.taskId },
      include: {
        lead: {
          include: {
            scriptVersion: true,
          },
        },
        step: true,
      },
    });

    if (!task) {
      throw new Error("Task not found.");
    }

    const now = new Date();

    await tx.task.update({
      where: { id: input.taskId },
      data: {
        status: TaskStatus.COMPLETED,
        completedAt: now,
        completedNote: input.explanation,
      },
    });

    await createActivityAndJourneyEvent(tx, {
      leadId: task.leadId,
      userId: input.userId,
      type: ActivityType.OUTCOME_SELECTED,
      journeyType: JourneyEventType.CUSTOM_OUTCOME_SELECTED,
      title: "Custom outcome selected",
      body: input.explanation,
      metadata: {
        manualTaskTitle: input.manualTask?.title,
        manualTaskDueAt: input.manualTask?.dueAt?.toISOString(),
        existingStepId: input.existingStepId,
        terminalStatus: input.terminalStatus,
        migrateToScriptVersionId: input.migrateToScriptVersionId,
      },
      step: task.step,
      scriptVersionId: task.lead.scriptVersionId,
      scriptVersionNumber: task.lead.scriptVersion?.version,
      leadStatus: task.lead.status,
    });

    if (input.migrateToScriptVersionId) {
      const targetVersion = await tx.scriptVersion.findUnique({
        where: { id: input.migrateToScriptVersionId },
      });

      if (targetVersion) {
        await tx.lead.update({
          where: { id: task.leadId },
          data: {
            scriptVersionId: targetVersion.id,
          },
        });

        await tx.journeyEvent.create({
          data: {
            leadId: task.leadId,
            userId: input.userId,
            type: JourneyEventType.SCRIPT_VERSION_MIGRATED,
            title: "Lead migrated to another script version",
            body: `Moved to ${targetVersion.name}.`,
            scriptVersionIdSnapshot: targetVersion.id,
            scriptVersionNumberSnapshot: targetVersion.version,
          },
        });
      }
    }

    if (input.terminalStatus) {
      await tx.lead.update({
        where: { id: task.leadId },
        data: {
          status: input.terminalStatus,
          nextTaskAt: null,
          completedAt: now,
        },
      });

      return;
    }

    if (input.existingStepId) {
      const step = await tx.scriptStep.findUnique({
        where: { id: input.existingStepId },
      });

      if (step) {
        await createTaskForStep(tx, {
          leadId: task.leadId,
          userId: input.userId,
          step,
          dueAt: now,
          leadContactName: task.lead.contactName,
        });

        await tx.lead.update({
          where: { id: task.leadId },
          data: {
            currentStepId: step.id,
            nextTaskAt: now,
            status: LeadStatus.ACTIVE,
          },
        });

        return;
      }
    }

    if (input.manualTask) {
      await tx.task.create({
        data: {
          leadId: task.leadId,
          userId: input.userId,
          title: input.manualTask.title,
          dueAt: input.manualTask.dueAt,
          description: input.explanation,
          priority: TaskPriority.NORMAL,
        },
      });

      await tx.lead.update({
        where: { id: task.leadId },
        data: {
          nextTaskAt: input.manualTask.dueAt,
        },
      });

      return;
    }

    await tx.lead.update({
      where: { id: task.leadId },
      data: {
        nextTaskAt: null,
      },
    });
  });
}
