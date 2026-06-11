import { LeadStatus, StepChannel } from "@prisma/client";
import { z } from "zod";

export const leadSchema = z.object({
  companyName: z.string().trim().min(1, "Company name is required."),
  contactName: z.string().trim().optional().or(z.literal("")),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  role: z.string().trim().optional().or(z.literal("")),
  website: z.string().trim().optional().or(z.literal("")),
  source: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
  tags: z.string().trim().optional().or(z.literal("")),
});

export const leadUpdateSchema = leadSchema.partial().extend({
  status: z.nativeEnum(LeadStatus).optional(),
  currentStepId: z.string().optional(),
});

export const manualTaskSchema = z.object({
  leadId: z.string().min(1),
  stepId: z.string().optional().or(z.literal("")),
  title: z.string().trim().min(1, "Task title is required."),
  description: z.string().trim().optional().or(z.literal("")),
  dueAt: z.string().min(1, "Due date is required."),
});

export const noteSchema = z.object({
  leadId: z.string().min(1),
  body: z.string().trim().min(1, "Note body is required."),
});

export const startLeadSchema = z.object({
  leadId: z.string().min(1),
});

export const completeTaskSchema = z.object({
  taskId: z.string().min(1),
  outcomeId: z.string().min(1),
  note: z.string().trim().optional().or(z.literal("")),
  scheduledAt: z.string().optional().or(z.literal("")),
  contactName: z.string().trim().optional().or(z.literal("")),
  contactEmail: z.email().optional().or(z.literal("")),
  contactPhone: z.string().trim().optional().or(z.literal("")),
  contactRole: z.string().trim().optional().or(z.literal("")),
});

export const customOutcomeSchema = z.object({
  taskId: z.string().min(1),
  explanation: z.string().trim().min(1, "Explain what happened."),
  manualTitle: z.string().trim().optional().or(z.literal("")),
  manualDueAt: z.string().optional().or(z.literal("")),
  existingStepId: z.string().optional().or(z.literal("")),
  terminalStatus: z.nativeEnum(LeadStatus).optional(),
  migrateToScriptVersionId: z.string().optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  activeScriptVersionId: z.string().trim().min(1),
  dailyNewLeadLimit: z.coerce.number().int().min(1).max(100),
  userName: z.string().trim().min(1),
  companyName: z.string().trim().min(1),
  defaultTimezone: z.string().trim().min(1),
  workingDays: z.array(z.string().trim().min(1)).min(1),
});

export const scriptSchema = z.object({
  name: z.string().trim().min(1, "Script name is required."),
  description: z.string().trim().optional().or(z.literal("")),
  template: z
    .enum(["blank", "trucka_carrier_invoice_outreach", "simple_email_call"])
    .optional()
    .default("blank"),
});

export const stepSchema = z.object({
  scriptVersionId: z.string().min(1),
  name: z.string().trim().min(1, "Step name is required."),
  key: z.string().trim().optional().or(z.literal("")),
  metricKey: z.string().trim().optional().or(z.literal("")),
  channel: z.nativeEnum(StepChannel),
  subject: z.string().trim().optional().or(z.literal("")),
  scriptText: z.string().trim().min(1, "Script text is required."),
  instructions: z.string().trim().optional().or(z.literal("")),
  defaultDelayDays: z.coerce.number().int().min(0).optional().default(0),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
  isStartStep: z.coerce.boolean().optional().default(false),
  isTerminalStep: z.coerce.boolean().optional().default(false),
  useCommonOutcomes: z.coerce.boolean().optional().default(false),
});

export const outcomeSchema = z
  .object({
    stepId: z.string().min(1),
    label: z.string().trim().min(1, "Outcome label is required."),
    key: z.string().trim().optional().or(z.literal("")),
    metricKey: z.string().trim().optional().or(z.literal("")),
    description: z.string().trim().optional().or(z.literal("")),
    nextStepId: z.string().optional().or(z.literal("")),
    delayDays: z.coerce.number().int().min(0).optional().default(0),
    delayChoice: z
      .enum([
        "immediately",
        "tomorrow",
        "in_2_days",
        "in_3_days",
        "in_5_days",
        "in_7_days",
        "choose_when_completing",
        "custom",
      ])
      .optional()
      .default("immediately"),
    actionType: z
      .enum([
        "go_to_step",
        "create_manual_task",
        "stop_sequence",
        "mark_won",
        "mark_lost",
        "mark_not_interested",
        "mark_disqualified",
      ])
      .optional()
      .default("go_to_step"),
    setLeadStatus: z.nativeEnum(LeadStatus).optional(),
    isTerminal: z.coerce.boolean().optional().default(false),
    requiresNote: z.coerce.boolean().optional().default(false),
    requiresDateTime: z.coerce.boolean().optional().default(false),
    requiresContact: z.coerce.boolean().optional().default(false),
    sortOrder: z.coerce.number().int().min(0).optional().default(0),
  })
  .superRefine((value, ctx) => {
    const terminalAction = [
      "stop_sequence",
      "mark_won",
      "mark_lost",
      "mark_not_interested",
      "mark_disqualified",
    ].includes(value.actionType ?? "");

    if (!terminalAction && value.actionType !== "create_manual_task" && !value.nextStepId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nextStepId"],
        message: "Select a next step unless this outcome is terminal.",
      });
    }

    if ((value.isTerminal || terminalAction) && !value.setLeadStatus && !value.actionType?.startsWith("mark_")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["setLeadStatus"],
        message: "Terminal outcomes must set a lead status.",
      });
    }
  });

export const leadImportRowSchema = z.object({
  companyName: z.string().trim().min(1),
  contactName: z.string().trim().optional().default(""),
  email: z.string().trim().optional().default(""),
  phone: z.string().trim().optional().default(""),
  role: z.string().trim().optional().default(""),
  website: z.string().trim().optional().default(""),
  source: z.string().trim().optional().default(""),
});
