import { LeadStatus, StepChannel, TaskPriority } from "@prisma/client";

export const DEFAULT_USER_NAME = "Dejan";
export const DEFAULT_COMPANY_NAME = "TruckA Company";
export const DEFAULT_TIMEZONE = "Europe/Belgrade";
export const DEFAULT_DAILY_NEW_LEAD_LIMIT = 10;

export const APP_SETTING_KEYS = {
  ACTIVE_SCRIPT_VERSION_ID: "activeScriptVersionId",
  DAILY_NEW_LEAD_LIMIT: "dailyNewLeadLimit",
  USER_NAME: "userName",
  COMPANY_NAME: "companyName",
  DEFAULT_TIMEZONE: "defaultTimezone",
  WORKING_DAYS: "workingDays",
} as const;

export const WORKING_DAYS_DEFAULT = ["MON", "TUE", "WED", "THU", "FRI"];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "New",
  ACTIVE: "Active",
  WAITING: "Waiting",
  DEMO_BOOKED: "Demo Booked",
  DOCUMENTS_REQUESTED: "Documents Requested",
  DOCUMENTS_RECEIVED: "Documents Received",
  LOOM_SENT: "Loom Sent",
  PILOT_PROPOSED: "Pilot Proposed",
  CLOSED_WON: "Closed Won",
  CLOSED_LOST: "Closed Lost",
  DISQUALIFIED: "Disqualified",
  NOT_INTERESTED: "Not Interested",
  PAUSED: "Paused",
};

export const STEP_CHANNEL_LABELS: Record<StepChannel, string> = {
  EMAIL: "Email",
  PHONE: "Phone",
  VOICEMAIL: "Voicemail",
  DEMO: "Demo",
  DOCUMENT_REQUEST: "Document Request",
  LOOM: "Loom",
  MANUAL: "Manual",
  CLOSE: "Close",
  BREAKUP: "Breakup",
};

export const HIGH_VALUE_CHANNELS: StepChannel[] = [
  StepChannel.DEMO,
  StepChannel.DOCUMENT_REQUEST,
  StepChannel.LOOM,
  StepChannel.CLOSE,
];

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};
