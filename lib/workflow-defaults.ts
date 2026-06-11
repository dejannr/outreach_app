import { LeadStatus, StepChannel } from "@prisma/client";

type DelayChoice =
  | "immediately"
  | "tomorrow"
  | "in_2_days"
  | "in_3_days"
  | "in_5_days"
  | "in_7_days"
  | "choose_when_completing"
  | "custom";

type ChannelPreset = {
  label: string;
  actionType: string;
  delayChoice: DelayChoice;
  status: LeadStatus;
  requiresDateTime?: boolean;
  requiresContact?: boolean;
};

export function generateKey(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s_]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function generateUniqueKey(baseKey: string, existingKeys: string[]) {
  if (!existingKeys.includes(baseKey)) {
    return baseKey;
  }

  let index = 2;
  while (existingKeys.includes(`${baseKey}_${index}`)) {
    index += 1;
  }

  return `${baseKey}_${index}`;
}

export function defaultMetricKeyForChannel(channel: StepChannel, name?: string) {
  const generatedName = name ? generateKey(name) : "";
  if (generatedName) {
    if (channel === StepChannel.EMAIL && generatedName.includes("email")) {
      return generatedName;
    }
    if (channel === StepChannel.PHONE && generatedName.includes("call")) {
      return generatedName;
    }
  }

  switch (channel) {
    case StepChannel.EMAIL:
      return "email_step";
    case StepChannel.PHONE:
      return "phone_call";
    case StepChannel.DEMO:
      return "demo";
    case StepChannel.DOCUMENT_REQUEST:
      return "document_request";
    case StepChannel.LOOM:
      return "loom";
    case StepChannel.CLOSE:
      return "close";
    case StepChannel.BREAKUP:
      return "breakup";
    case StepChannel.VOICEMAIL:
      return "voicemail";
    case StepChannel.MANUAL:
      return "manual_step";
    default:
      return generatedName || "step";
  }
}

export function nextSortOrder(existing: number[]) {
  if (!existing.length) {
    return 1;
  }

  return Math.max(...existing) + 1;
}

export function delayChoiceToConfig(delayChoice: DelayChoice, customDelayDays?: number) {
  switch (delayChoice) {
    case "immediately":
      return { delayDays: 0, requiresDateTime: false };
    case "tomorrow":
      return { delayDays: 1, requiresDateTime: false };
    case "in_2_days":
      return { delayDays: 2, requiresDateTime: false };
    case "in_3_days":
      return { delayDays: 3, requiresDateTime: false };
    case "in_5_days":
      return { delayDays: 5, requiresDateTime: false };
    case "in_7_days":
      return { delayDays: 7, requiresDateTime: false };
    case "choose_when_completing":
      return { delayDays: 0, requiresDateTime: true };
    case "custom":
      return { delayDays: customDelayDays ?? 0, requiresDateTime: false };
    default:
      return { delayDays: 0, requiresDateTime: false };
  }
}

export function inferStatusFromOutcomeKey(key: string) {
  const normalized = generateKey(key);
  const mapping: Record<string, LeadStatus> = {
    not_interested: LeadStatus.NOT_INTERESTED,
    bad_contact: LeadStatus.DISQUALIFIED,
    bad_contact_info: LeadStatus.DISQUALIFIED,
    demo_booked: LeadStatus.DEMO_BOOKED,
    documents_requested: LeadStatus.DOCUMENTS_REQUESTED,
    documents_received: LeadStatus.DOCUMENTS_RECEIVED,
    loom_sent: LeadStatus.LOOM_SENT,
    pilot_accepted: LeadStatus.CLOSED_WON,
    accepted: LeadStatus.CLOSED_WON,
    closed_lost: LeadStatus.CLOSED_LOST,
    sent_waiting: LeadStatus.WAITING,
    sent_waiting_for_documents: LeadStatus.DOCUMENTS_REQUESTED,
    sent_no_reply_yet: LeadStatus.WAITING,
    no_reply: LeadStatus.WAITING,
    no_answer: LeadStatus.WAITING,
    voicemail_left: LeadStatus.WAITING,
    positive_reply: LeadStatus.ACTIVE,
    interested: LeadStatus.ACTIVE,
  };

  return mapping[normalized];
}

export function isTerminalAction(actionType: string) {
  return [
    "stop_sequence",
    "mark_won",
    "mark_lost",
    "mark_not_interested",
    "mark_disqualified",
  ].includes(actionType);
}

export function actionTypeToStatus(actionType: string) {
  switch (actionType) {
    case "mark_won":
      return LeadStatus.CLOSED_WON;
    case "mark_lost":
      return LeadStatus.CLOSED_LOST;
    case "mark_not_interested":
      return LeadStatus.NOT_INTERESTED;
    case "mark_disqualified":
      return LeadStatus.DISQUALIFIED;
    default:
      return undefined;
  }
}

export function channelPresets(channel: StepChannel): ChannelPreset[] {
  switch (channel) {
    case StepChannel.EMAIL:
      return [
        { label: "Sent / Waiting", actionType: "go_to_step", delayChoice: "in_3_days", status: LeadStatus.WAITING },
        { label: "Positive Reply", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.ACTIVE },
        { label: "Not Interested", actionType: "mark_not_interested", delayChoice: "immediately", status: LeadStatus.NOT_INTERESTED },
        { label: "Bad Contact", actionType: "mark_disqualified", delayChoice: "immediately", status: LeadStatus.DISQUALIFIED },
      ];
    case StepChannel.PHONE:
      return [
        { label: "No Answer", actionType: "go_to_step", delayChoice: "tomorrow", status: LeadStatus.WAITING },
        { label: "Voicemail Left", actionType: "go_to_step", delayChoice: "tomorrow", status: LeadStatus.WAITING },
        { label: "Busy - Call Back", actionType: "go_to_step", delayChoice: "choose_when_completing", status: LeadStatus.ACTIVE, requiresDateTime: true },
        { label: "Interested", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.ACTIVE },
        { label: "Wrong Person", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.ACTIVE, requiresContact: true },
        { label: "Not Interested", actionType: "mark_not_interested", delayChoice: "immediately", status: LeadStatus.NOT_INTERESTED },
      ];
    case StepChannel.DEMO:
      return [
        { label: "Documents Requested", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.DOCUMENTS_REQUESTED },
        { label: "Needs Time", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.WAITING },
        { label: "Not A Fit", actionType: "mark_disqualified", delayChoice: "immediately", status: LeadStatus.DISQUALIFIED },
        { label: "Not Interested", actionType: "mark_not_interested", delayChoice: "immediately", status: LeadStatus.NOT_INTERESTED },
      ];
    case StepChannel.DOCUMENT_REQUEST:
      return [
        { label: "Documents Received", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.DOCUMENTS_RECEIVED },
        { label: "Still Waiting", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.DOCUMENTS_REQUESTED },
        { label: "Not Interested", actionType: "mark_not_interested", delayChoice: "immediately", status: LeadStatus.NOT_INTERESTED },
      ];
    case StepChannel.LOOM:
      return [
        { label: "Loom Sent", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.LOOM_SENT },
        { label: "Acknowledged Value", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.ACTIVE },
        { label: "Needs Team Review", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.WAITING },
        { label: "No Reply", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.WAITING },
        { label: "Not Interested", actionType: "mark_not_interested", delayChoice: "immediately", status: LeadStatus.NOT_INTERESTED },
      ];
    case StepChannel.CLOSE:
      return [
        { label: "Accepted", actionType: "mark_won", delayChoice: "immediately", status: LeadStatus.CLOSED_WON },
        { label: "Needs Time", actionType: "go_to_step", delayChoice: "in_2_days", status: LeadStatus.WAITING },
        { label: "Price Objection", actionType: "go_to_step", delayChoice: "immediately", status: LeadStatus.ACTIVE },
        { label: "Not Interested", actionType: "mark_lost", delayChoice: "immediately", status: LeadStatus.CLOSED_LOST },
      ];
    default:
      return [];
  }
}

export function defaultStepContent(channel: StepChannel) {
  switch (channel) {
    case StepChannel.EMAIL:
      return {
        subject: "",
        scriptText: "Write the email body here.",
        instructions: "Keep the message short and specific.",
      };
    case StepChannel.PHONE:
      return {
        subject: "",
        scriptText: "Write the call opener and qualification flow here.",
        instructions: "Keep the call short. Ask one clear next-question at a time.",
      };
    case StepChannel.DEMO:
      return {
        subject: "",
        scriptText: "Write the demo talk track here.",
        instructions: "Focus on the workflow and the next step.",
      };
    case StepChannel.DOCUMENT_REQUEST:
      return {
        subject: "Documents for workflow test",
        scriptText: "Ask for the documents needed to run the workflow test.",
        instructions: "Be specific about what needs to be sent.",
      };
    case StepChannel.CLOSE:
      return {
        subject: "",
        scriptText: "Write the close ask here.",
        instructions: "Ask directly for the next commitment.",
      };
    default:
      return {
        subject: "",
        scriptText: "",
        instructions: "",
      };
  }
}
