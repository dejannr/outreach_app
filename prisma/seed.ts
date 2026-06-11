import {
  LeadStatus,
  Prisma,
  StepChannel,
} from "@prisma/client";

import {
  APP_SETTING_KEYS,
  DEFAULT_COMPANY_NAME,
  DEFAULT_DAILY_NEW_LEAD_LIMIT,
  DEFAULT_TIMEZONE,
  DEFAULT_USER_NAME,
  WORKING_DAYS_DEFAULT,
} from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type SeedOutcome = {
  label: string;
  key: string;
  metricKey: string;
  description?: string;
  nextStepKey?: string;
  delayDays: number;
  setLeadStatus?: LeadStatus;
  isTerminal?: boolean;
  requiresNote?: boolean;
  requiresDateTime?: boolean;
  requiresContact?: boolean;
  sortOrder: number;
};

type SeedStep = {
  key: string;
  metricKey: string;
  name: string;
  channel: StepChannel;
  subject?: string;
  scriptText: string;
  instructions?: string;
  defaultDelayDays?: number;
  isStartStep?: boolean;
  isTerminalStep?: boolean;
  sortOrder: number;
  outcomes: SeedOutcome[];
};

const steps: SeedStep[] = [
  {
    key: "day_1_initial_email",
    metricKey: "initial_email",
    name: "Day 1 Initial Email",
    channel: StepChannel.EMAIL,
    subject: "Invoice question",
    scriptText: `Hi {{contactName}},

Are you currently creating invoices manually from Rate Cons and BOLs?

I'm Dejan from TruckA Company. We're working with carriers to automate that process and reduce the time it takes to invoice brokers after delivery.

Would it be worth a quick conversation?

-Dejan from TruckA Company`,
    instructions:
      "Goal: Get a conversation. Do not explain more. Do not attach anything. Do not mention AI.",
    isStartStep: true,
    sortOrder: 1,
    outcomes: [
      { label: "Sent / No Reply Yet", key: "sent_no_reply_yet", metricKey: "sent_no_reply_yet", nextStepKey: "day_4_follow_up_email", delayDays: 3, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "qualify_positive_reply", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
      { label: "Bad Contact Info", key: "bad_contact_info", metricKey: "bad_contact_info", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 4 },
    ],
  },
  {
    key: "qualify_positive_reply",
    metricKey: "qualification_email",
    name: "Qualify Positive Reply",
    channel: StepChannel.EMAIL,
    subject: "Re: Invoice question",
    scriptText: `Thanks {{contactName}}.

Just so I understand your process:

Who handles invoicing today?
Roughly how many invoices do you create each month?
Are invoices created manually from Rate Cons and BOLs?

Happy to show you a quick 15-minute demo.

-Dejan from TruckA Company`,
    sortOrder: 2,
    outcomes: [
      { label: "Answered Questions", key: "answered_questions", metricKey: "answered_questions", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Asked For More Info", key: "asked_for_more_info", metricKey: "asked_for_more_info", nextStepKey: "send_short_info", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "No Reply After Qualification", key: "no_reply_after_qualification", metricKey: "no_reply_after_qualification", nextStepKey: "follow_up_qualification", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "day_4_follow_up_email",
    metricKey: "follow_up_email",
    name: "Day 4 Follow-Up Email",
    channel: StepChannel.EMAIL,
    subject: "Re: Invoice question",
    scriptText: `Hi {{contactName}},

Following up on my previous email.

Most carriers we speak with still have someone manually transferring load information from Rate Cons and BOLs into invoices.

At TruckA Company, we're helping automate that step so invoices can be sent to brokers faster.

Interested in seeing a quick example?

-Dejan from TruckA Company`,
    sortOrder: 3,
    outcomes: [
      { label: "Sent / No Reply Yet", key: "sent_no_reply_yet", metricKey: "sent_no_reply_yet", nextStepKey: "day_8_phone_call", delayDays: 4, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "ask_current_invoice_process", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
      { label: "Bad Contact Info", key: "bad_contact_info", metricKey: "bad_contact_info", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 4 },
    ],
  },
  {
    key: "ask_current_invoice_process",
    metricKey: "ask_current_process",
    name: "Ask Current Invoice Process",
    channel: StepChannel.EMAIL,
    subject: "Re: Invoice question",
    scriptText: `Curious, how are you creating invoices today?

-Dejan from TruckA Company`,
    sortOrder: 4,
    outcomes: [
      { label: "Explained Manual Process", key: "explained_manual_process", metricKey: "manual_process_confirmed", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Already Automated", key: "already_automated", metricKey: "already_automated", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 2 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "follow_up_current_process", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 3 },
    ],
  },
  {
    key: "day_8_phone_call",
    metricKey: "phone_call_attempt",
    name: "Day 8 Phone Call",
    channel: StepChannel.PHONE,
    scriptText: `Hi {{contactName}},

This is Dejan from TruckA Company.

I sent you an email a few days ago about invoice automation for carriers.

Did I catch you at a bad time?`,
    instructions:
      `Formula: Context → Permission → Problem Question → Qualification → Next Step.

After the opener, stop and let them answer.

If they say no, ask:
"Perfect, I'll be brief. Quick question — are invoices still being created manually from Rate Cons and BOLs?"

Do not pitch for 5 minutes.`,
    sortOrder: 5,
    outcomes: [
      { label: "No Answer", key: "no_answer", metricKey: "no_answer", nextStepKey: "day_9_email_after_call_attempt", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Voicemail Left", key: "voicemail_left", metricKey: "voicemail_left", nextStepKey: "day_9_email_after_call_attempt", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Busy - Call Back", key: "busy_call_back", metricKey: "busy_call_back", nextStepKey: "day_8_callback", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, requiresDateTime: true, sortOrder: 3 },
      { label: "Interested", key: "interested", metricKey: "interested", nextStepKey: "phone_qualification", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 4 },
      { label: "Manual Process Confirmed", key: "manual_process_confirmed", metricKey: "manual_process_confirmed", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 5 },
      { label: "Already Has Software", key: "already_has_software", metricKey: "already_has_software", nextStepKey: "software_objection_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 6 },
      { label: "Wrong Person", key: "wrong_person", metricKey: "wrong_person", nextStepKey: "wrong_person_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, requiresContact: true, sortOrder: 7 },
      { label: "Gatekeeper", key: "gatekeeper", metricKey: "gatekeeper", nextStepKey: "gatekeeper_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 8 },
      { label: "Send Me Info", key: "send_me_info", metricKey: "send_me_info", nextStepKey: "send_short_info", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 9 },
      { label: "Asked Price", key: "asked_price", metricKey: "asked_price", nextStepKey: "price_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 10 },
      { label: "Asked If AI", key: "asked_if_ai", metricKey: "asked_if_ai", nextStepKey: "ai_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 11 },
      { label: "Document Privacy Concern", key: "document_privacy_concern", metricKey: "privacy_concern", nextStepKey: "privacy_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 12 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 13 },
    ],
  },
  {
    key: "day_8_callback",
    metricKey: "callback_attempt",
    name: "Day 8 Callback",
    channel: StepChannel.PHONE,
    scriptText: `Hi {{contactName}},

This is Dejan from TruckA Company.

You asked me to call back around this time.

Quick question — are invoices still being created manually from Rate Cons and BOLs?`,
    sortOrder: 6,
    outcomes: [
      { label: "No Answer", key: "no_answer", metricKey: "no_answer", nextStepKey: "day_9_email_after_call_attempt", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Voicemail Left", key: "voicemail_left", metricKey: "voicemail_left", nextStepKey: "day_9_email_after_call_attempt", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Manual Process Confirmed", key: "manual_process_confirmed", metricKey: "manual_process_confirmed", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 3 },
      { label: "Interested", key: "interested", metricKey: "interested", nextStepKey: "phone_qualification", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 4 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 5 },
    ],
  },
  {
    key: "phone_qualification",
    metricKey: "phone_qualification",
    name: "Phone Qualification",
    channel: StepChannel.PHONE,
    scriptText: `Got it.

Roughly how many invoices are you creating per month?

And who usually creates them?

Are they created directly from Rate Cons and BOLs, or do you use another system first?

That makes sense.

This is exactly the workflow TruckA Company is focused on.

Would it be useful if I showed you a quick 15-minute demo of how a Rate Con and BOL become an invoice?`,
    sortOrder: 7,
    outcomes: [
      { label: "Demo Accepted", key: "demo_accepted", metricKey: "demo_booked", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 1 },
      { label: "Demo Hesitation", key: "demo_hesitation", metricKey: "demo_hesitation", nextStepKey: "demo_hesitation_handling", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Enough Volume", key: "not_enough_volume", metricKey: "not_enough_volume", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "software_objection_handling",
    metricKey: "software_objection",
    name: "Software Objection Handling",
    channel: StepChannel.PHONE,
    scriptText: `That makes sense.

Most carriers we talk to already have some invoicing or accounting system.

The manual part is usually before that — pulling details from Rate Cons and BOLs and making sure the invoice is correct.

Is that part automated for you, or does someone still review and enter those details manually?`,
    sortOrder: 8,
    outcomes: [
      { label: "Manual Part Still Exists", key: "manual_part_still_exists", metricKey: "manual_part_still_exists", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Fully Automated", key: "fully_automated", metricKey: "fully_automated", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "wrong_person_handling",
    metricKey: "wrong_person",
    name: "Wrong Person Handling",
    channel: StepChannel.MANUAL,
    scriptText: `Got it.

Who would be the right person to ask about how invoices are created from Rate Cons and BOLs?

Perfect.

Would you mind pointing me to the best email or phone number for them?`,
    sortOrder: 9,
    outcomes: [
      { label: "Got Correct Contact", key: "got_correct_contact", metricKey: "got_correct_contact", nextStepKey: "new_contact_intro_email", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, requiresContact: true, sortOrder: 1 },
      { label: "No Contact Available", key: "no_contact_available", metricKey: "no_contact_available", nextStepKey: "general_follow_up", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "gatekeeper_handling",
    metricKey: "gatekeeper_handling",
    name: "Gatekeeper Handling",
    channel: StepChannel.PHONE,
    scriptText: `Hi, this is Dejan from TruckA Company.

I'm trying to reach the person who handles invoicing or billing for your loads.

Who would be the best person to speak with?

If they ask what it is regarding:

It's about reducing the manual work of creating invoices from Rate Cons and BOLs.

If they ask if it is sales:

I'm reaching out to see if the invoice workflow is still manual and whether TruckA Company could help.

Who usually handles billing there?`,
    sortOrder: 10,
    outcomes: [
      { label: "Transferred To Right Person", key: "transferred_to_right_person", metricKey: "transferred_to_right_person", nextStepKey: "day_8_phone_call", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Got Correct Contact", key: "got_correct_contact", metricKey: "got_correct_contact", nextStepKey: "new_contact_intro_email", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, requiresContact: true, sortOrder: 2 },
      { label: "No Info Given", key: "no_info_given", metricKey: "no_info_given", nextStepKey: "day_9_email_after_call_attempt", delayDays: 1, setLeadStatus: LeadStatus.WAITING, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "send_short_info",
    metricKey: "send_short_info",
    name: "Send Short Info",
    channel: StepChannel.EMAIL,
    subject: "TruckA Company invoice workflow",
    scriptText: `{{contactName}},

Thanks for taking my call.

Quick summary:

TruckA Company helps carriers create invoices faster from Rate Cons and BOLs.

The main thing we help with is reducing the manual work of opening documents, copying load details, checking amounts, and creating invoices.

If invoice creation is still manual for your team, I think it would be worth showing you a quick example.

-Dejan from TruckA Company`,
    sortOrder: 11,
    outcomes: [
      { label: "Sent", key: "sent", metricKey: "sent", nextStepKey: "follow_up_after_info", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "price_handling",
    metricKey: "price_handling",
    name: "Price Handling",
    channel: StepChannel.PHONE,
    scriptText: `It depends on volume and setup, but for early customers we're keeping it simple and starting with a 30-day pilot.

Before pricing matters, the main question is whether TruckA Company can actually save your team time on invoice creation.

Are invoices currently created manually from Rate Cons and BOLs?`,
    sortOrder: 12,
    outcomes: [
      { label: "Continues Conversation", key: "continues_conversation", metricKey: "continues_conversation", nextStepKey: "phone_qualification", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Still Wants Demo", key: "still_wants_demo", metricKey: "still_wants_demo", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "ai_handling",
    metricKey: "ai_handling",
    name: "AI Handling",
    channel: StepChannel.PHONE,
    scriptText: `There is automation behind it, but the main point is simple:

TruckA Company helps turn Rate Cons and BOLs into invoices so your team doesn't have to retype everything manually.

The result matters more than the technology.

Is invoice creation still manual for your team today?`,
    sortOrder: 13,
    outcomes: [
      { label: "Manual Process Confirmed", key: "manual_process_confirmed", metricKey: "manual_process_confirmed", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Still Concerned", key: "still_concerned", metricKey: "still_concerned", nextStepKey: "send_short_info", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "privacy_handling",
    metricKey: "privacy_handling",
    name: "Privacy Handling",
    channel: StepChannel.PHONE,
    scriptText: `Completely understand.

For the test, you can redact anything sensitive.

We only need enough information to see whether the workflow works:

load details
dates
amounts
broker/customer fields
pickup and delivery information

The point is not to get private information.

The point is to prove whether TruckA Company can create accurate invoices from the same documents your team already uses.

Would sending 3-5 redacted examples be comfortable?`,
    sortOrder: 14,
    outcomes: [
      { label: "Agrees To Documents", key: "agrees_to_documents", metricKey: "agrees_to_documents", nextStepKey: "document_request_email", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_REQUESTED, sortOrder: 1 },
      { label: "Wants Demo First", key: "wants_demo_first", metricKey: "wants_demo_first", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 2 },
      { label: "Not Comfortable", key: "not_comfortable", metricKey: "not_comfortable", nextStepKey: "follow_up_privacy", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "book_demo_ask",
    metricKey: "book_demo_ask",
    name: "Book Demo Ask",
    channel: StepChannel.MANUAL,
    scriptText: `That makes sense.

I think it would be easier to show you than explain it.

Would you be open to a quick 15-minute demo where I show how TruckA Company turns a Rate Con and BOL into an invoice?

-Dejan from TruckA Company`,
    sortOrder: 15,
    outcomes: [
      { label: "Demo Booked", key: "demo_booked", metricKey: "demo_booked", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 1 },
      { label: "Asked For Info First", key: "asked_for_info_first", metricKey: "asked_for_info_first", nextStepKey: "send_short_info", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "follow_up_demo_ask", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 4 },
    ],
  },
  {
    key: "demo",
    metricKey: "demo",
    name: "Demo",
    channel: StepChannel.DEMO,
    scriptText: `{{contactName}}, appreciate you taking the time.

I'll keep this quick.

I want to first understand how you're creating invoices today, then I'll show how TruckA Company turns a Rate Con and BOL into an invoice.

If it looks relevant, the next step would just be testing a few of your own documents.

Questions:

How many trucks are you running?
Roughly how many invoices do you create each month?
Who creates invoices today?
What software do you use for invoicing or accounting?
Are invoices created from Rate Cons, BOLs, PODs, or something else?
How soon after delivery do invoices usually get sent?
What is the biggest billing headache right now?

Then show:

Rate Con → BOL → Invoice

Do not show settings.
Do not show features.
Do not show roadmap.
Only show the outcome.

End by asking:

Would you be willing to send me 3-5 recent Rate Cons and BOLs so I can test them in your workflow?

You can redact anything sensitive if needed.`,
    sortOrder: 16,
    outcomes: [
      { label: "Documents Requested", key: "documents_requested", metricKey: "documents_requested", nextStepKey: "document_request_email", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_REQUESTED, sortOrder: 1 },
      { label: "Needs Time To Think", key: "needs_time_to_think", metricKey: "needs_time_to_think", nextStepKey: "think_about_it_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not A Fit", key: "not_a_fit", metricKey: "not_a_fit", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "document_request_email",
    metricKey: "document_request",
    name: "Document Request Email",
    channel: StepChannel.DOCUMENT_REQUEST,
    subject: "Documents for TruckA Company workflow test",
    scriptText: `{{contactName}},

Thanks for taking the time today.

For the workflow test, please send:

3-5 recent Rate Cons
The matching BOLs
Any invoice template or example invoice you currently use, if available

You can redact anything sensitive if needed.

I'll use these to test how TruckA Company handles your actual invoice workflow and send you a short video showing the results.

-Dejan from TruckA Company`,
    sortOrder: 17,
    outcomes: [
      { label: "Sent / Waiting For Documents", key: "sent_waiting_for_documents", metricKey: "waiting_for_documents", nextStepKey: "follow_up_for_documents", delayDays: 2, setLeadStatus: LeadStatus.DOCUMENTS_REQUESTED, sortOrder: 1 },
      { label: "Documents Received", key: "documents_received", metricKey: "documents_received", nextStepKey: "create_loom_from_documents", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_RECEIVED, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "follow_up_for_documents",
    metricKey: "follow_up_documents",
    name: "Follow Up For Documents",
    channel: StepChannel.EMAIL,
    subject: "Re: Documents for TruckA Company workflow test",
    scriptText: `{{contactName}},

Wanted to follow up on the workflow test.

If it's easier, you can send 2-3 redacted Rate Cons and matching BOLs to start.

The goal is just to show whether TruckA Company can create invoices from the same paperwork your team already uses.

-Dejan from TruckA Company`,
    sortOrder: 18,
    outcomes: [
      { label: "Documents Received", key: "documents_received", metricKey: "documents_received", nextStepKey: "create_loom_from_documents", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_RECEIVED, sortOrder: 1 },
      { label: "Still Waiting", key: "still_waiting", metricKey: "still_waiting", nextStepKey: "breakup_email", delayDays: 5, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "create_loom_from_documents",
    metricKey: "loom_creation",
    name: "Create Loom From Documents",
    channel: StepChannel.LOOM,
    scriptText: `Record a Loom video.

Say:

{{contactName}},

I used three of your recent loads.

Here's exactly how they were processed.

Invoice #1 took 12 seconds.
Invoice #2 took 14 seconds.
Invoice #3 took 11 seconds.

This is the same workflow your team is doing manually today.

TruckA Company turns the Rate Con and BOL into an invoice without your team retyping the load details.

The main question is whether this would save your team time every week.`,
    sortOrder: 19,
    outcomes: [
      { label: "Loom Sent", key: "loom_sent", metricKey: "loom_sent", nextStepKey: "loom_48_hour_follow_up", delayDays: 2, setLeadStatus: LeadStatus.LOOM_SENT, sortOrder: 1 },
      { label: "Need More Documents", key: "need_more_documents", metricKey: "need_more_documents", nextStepKey: "document_request_email", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_REQUESTED, sortOrder: 2 },
      { label: "Not A Fit", key: "not_a_fit", metricKey: "not_a_fit", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.DISQUALIFIED, sortOrder: 3 },
    ],
  },
  {
    key: "loom_48_hour_follow_up",
    metricKey: "loom_follow_up",
    name: "48-Hour Loom Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company workflow test",
    scriptText: `{{contactName}},

Based on the test, do you think this would save your team time every week?

-Dejan from TruckA Company`,
    sortOrder: 20,
    outcomes: [
      { label: "Acknowledged Value", key: "acknowledged_value", metricKey: "acknowledged_value", nextStepKey: "pilot_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "Needs Team Review", key: "needs_team_review", metricKey: "needs_team_review", nextStepKey: "team_review_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "post_loom_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 4 },
    ],
  },
  {
    key: "pilot_close",
    metricKey: "pilot_close",
    name: "Pilot Close",
    channel: StepChannel.CLOSE,
    scriptText: `That makes sense.

I'd like to onboard you as an early customer for TruckA Company.

We'll handle setup and invoice templates for you.

Would you like to start with a 30-day pilot?

-Dejan from TruckA Company`,
    sortOrder: 21,
    outcomes: [
      { label: "Pilot Accepted", key: "pilot_accepted", metricKey: "closed_won", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_WON, sortOrder: 1 },
      { label: "Needs To Think", key: "needs_to_think", metricKey: "needs_to_think", nextStepKey: "think_about_it_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Price Objection", key: "price_objection", metricKey: "price_objection", nextStepKey: "price_objection_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 3 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 4 },
    ],
  },
  {
    key: "price_objection_close",
    metricKey: "price_objection_close",
    name: "Price Objection Close",
    channel: StepChannel.CLOSE,
    scriptText: `I understand.

That's why I think starting with a 30-day pilot makes more sense than a long commitment.

The goal is to prove the time savings first.

If it doesn't save your team time, then it doesn't make sense to continue.

Would a 30-day pilot be a reasonable way to test that?`,
    sortOrder: 22,
    outcomes: [
      { label: "Pilot Accepted", key: "pilot_accepted", metricKey: "closed_won", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_WON, sortOrder: 1 },
      { label: "Still Unsure", key: "still_unsure", metricKey: "still_unsure", nextStepKey: "think_about_it_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 3 },
    ],
  },
  {
    key: "think_about_it_follow_up",
    metricKey: "think_about_it",
    name: "Think About It Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company",
    scriptText: `{{contactName}},

Thanks again.

I'll give you some time to review.

The main thing to consider is whether the test showed that TruckA Company can save your team time creating invoices from Rate Cons and BOLs.

I'll follow up in a couple of days.

-Dejan from TruckA Company`,
    sortOrder: 23,
    outcomes: [
      { label: "Sent", key: "sent", metricKey: "sent", nextStepKey: "final_decision_follow_up", delayDays: 3, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "pilot_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 3 },
    ],
  },
  {
    key: "final_decision_follow_up",
    metricKey: "final_decision",
    name: "Final Decision Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company",
    scriptText: `{{contactName}},

Should I assume this is not a priority right now?

No problem either way.

-Dejan from TruckA Company`,
    sortOrder: 24,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "pilot_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "breakup_email", delayDays: 3, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 3 },
    ],
  },
  {
    key: "day_9_email_after_call_attempt",
    metricKey: "post_call_email",
    name: "Day 9 Email After Call Attempt",
    channel: StepChannel.EMAIL,
    subject: "Tried reaching you",
    scriptText: `{{contactName}},

Tried reaching you today.

Curious if invoice creation is still a manual process for your team.

If so, I think what we're building at TruckA Company could be useful.

Happy to show you.

-Dejan from TruckA Company`,
    sortOrder: 25,
    outcomes: [
      { label: "Sent / No Reply Yet", key: "sent_no_reply_yet", metricKey: "sent_no_reply_yet", nextStepKey: "day_14_value_email", delayDays: 5, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "ask_current_invoice_process", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "day_14_value_email",
    metricKey: "value_email",
    name: "Day 14 Value Email",
    channel: StepChannel.EMAIL,
    subject: "Invoice time",
    scriptText: `{{contactName}},

One thing we've noticed:

Many carriers think invoice creation only takes a few minutes per load.

But when you include:

Opening Rate Cons
Checking BOLs
Copying load details
Verifying amounts
Sending invoices

It often adds up to several hours every week.

Is that something your team deals with today?

-Dejan from TruckA Company`,
    sortOrder: 26,
    outcomes: [
      { label: "Sent / No Reply Yet", key: "sent_no_reply_yet", metricKey: "sent_no_reply_yet", nextStepKey: "breakup_email", delayDays: 7, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "ask_current_invoice_process", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "breakup_email",
    metricKey: "breakup_email",
    name: "Breakup Email",
    channel: StepChannel.BREAKUP,
    subject: "Closing the loop",
    scriptText: `{{contactName}},

I've reached out a few times and haven't heard back.

I'll assume invoice automation isn't a priority right now.

If that changes later, feel free to reach out.

Best,

Dejan from TruckA Company`,
    sortOrder: 27,
    outcomes: [
      { label: "Sent / No Reply", key: "sent_no_reply", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "ask_current_invoice_process", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
    ],
  },
  {
    key: "follow_up_qualification",
    metricKey: "follow_up_qualification",
    name: "Follow Up Qualification",
    channel: StepChannel.EMAIL,
    subject: "Re: Invoice question",
    scriptText: `Hi {{contactName}},

Wanted to circle back on the questions below.

If invoice creation is still manual, I think a short demo would be the fastest way to see whether TruckA Company is relevant.

-Dejan from TruckA Company`,
    sortOrder: 28,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "day_8_phone_call", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "follow_up_current_process",
    metricKey: "follow_up_current_process",
    name: "Follow Up Current Process",
    channel: StepChannel.EMAIL,
    subject: "Re: Invoice question",
    scriptText: `Hi {{contactName}},

Following up on my question about your invoice workflow.

If the process is still manual, I can show you quickly what TruckA Company looks like in practice.

-Dejan from TruckA Company`,
    sortOrder: 29,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "day_8_phone_call", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "new_contact_intro_email",
    metricKey: "new_contact_intro",
    name: "New Contact Intro Email",
    channel: StepChannel.EMAIL,
    subject: "Quick question",
    scriptText: `Hi {{contactName}},

I was pointed your way regarding how invoices are created today.

Are invoices still being created manually from Rate Cons and BOLs?

If so, I think TruckA Company may be worth a quick look.

-Dejan from TruckA Company`,
    sortOrder: 30,
    outcomes: [
      { label: "Sent / No Reply Yet", key: "sent_no_reply_yet", metricKey: "sent_no_reply_yet", nextStepKey: "day_4_follow_up_email", delayDays: 3, setLeadStatus: LeadStatus.WAITING, sortOrder: 1 },
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "ask_current_invoice_process", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "general_follow_up",
    metricKey: "general_follow_up",
    name: "General Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Quick follow-up",
    scriptText: `Hi {{contactName}},

Following up in case there is someone else on your team who handles invoicing.

If you can point me in the right direction, I’ll keep it brief.

-Dejan from TruckA Company`,
    sortOrder: 31,
    outcomes: [
      { label: "Got Contact", key: "got_contact", metricKey: "got_contact", nextStepKey: "new_contact_intro_email", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, requiresContact: true, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "breakup_email", delayDays: 3, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "demo_hesitation_handling",
    metricKey: "demo_hesitation",
    name: "Demo Hesitation Handling",
    channel: StepChannel.PHONE,
    scriptText: `No problem.

The goal of the demo is simply to show whether the workflow is worth testing.

If it doesn't look relevant, we stop there.

Would a short 15-minute look be reasonable?`,
    sortOrder: 32,
    outcomes: [
      { label: "Demo Accepted", key: "demo_accepted", metricKey: "demo_booked", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 1 },
      { label: "Asked For Info First", key: "asked_for_info_first", metricKey: "asked_for_info_first", nextStepKey: "send_short_info", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "follow_up_after_info",
    metricKey: "follow_up_after_info",
    name: "Follow Up After Info",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company invoice workflow",
    scriptText: `Hi {{contactName}},

Wanted to follow up on the summary I sent.

If invoice creation is still manual, the fastest next step is a short demo.

-Dejan from TruckA Company`,
    sortOrder: 33,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "book_demo_ask", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "day_8_phone_call", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "follow_up_privacy",
    metricKey: "follow_up_privacy",
    name: "Follow Up Privacy",
    channel: StepChannel.EMAIL,
    subject: "Re: workflow test",
    scriptText: `Hi {{contactName}},

Following up on the document privacy concern.

Redacted examples are completely fine. The goal is only to verify whether the workflow works for your team.

-Dejan from TruckA Company`,
    sortOrder: 34,
    outcomes: [
      { label: "Agrees To Documents", key: "agrees_to_documents", metricKey: "agrees_to_documents", nextStepKey: "document_request_email", delayDays: 0, setLeadStatus: LeadStatus.DOCUMENTS_REQUESTED, sortOrder: 1 },
      { label: "Wants Demo First", key: "wants_demo_first", metricKey: "wants_demo_first", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
  {
    key: "team_review_follow_up",
    metricKey: "team_review_follow_up",
    name: "Team Review Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company workflow test",
    scriptText: `Hi {{contactName}},

Wanted to follow up after your team review.

If the test looked useful, the next step is just a short pilot to prove the time savings.

-Dejan from TruckA Company`,
    sortOrder: 35,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "pilot_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "final_decision_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 3 },
    ],
  },
  {
    key: "post_loom_follow_up",
    metricKey: "post_loom_follow_up",
    name: "Post-Loom Follow-Up",
    channel: StepChannel.EMAIL,
    subject: "Re: TruckA Company workflow test",
    scriptText: `Hi {{contactName}},

Checking back on the Loom I sent.

If it looked relevant, I’d be happy to talk through next steps.

-Dejan from TruckA Company`,
    sortOrder: 36,
    outcomes: [
      { label: "Positive Reply", key: "positive_reply", metricKey: "positive_reply", nextStepKey: "pilot_close", delayDays: 0, setLeadStatus: LeadStatus.ACTIVE, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "final_decision_follow_up", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "closed_lost", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.CLOSED_LOST, sortOrder: 3 },
    ],
  },
  {
    key: "follow_up_demo_ask",
    metricKey: "follow_up_demo_ask",
    name: "Follow Up Demo Ask",
    channel: StepChannel.EMAIL,
    subject: "Re: quick demo",
    scriptText: `Hi {{contactName}},

Following up on my note about a quick demo.

If seeing the workflow would help, I can keep it to 15 minutes.

-Dejan from TruckA Company`,
    sortOrder: 37,
    outcomes: [
      { label: "Demo Booked", key: "demo_booked", metricKey: "demo_booked", nextStepKey: "demo", delayDays: 0, setLeadStatus: LeadStatus.DEMO_BOOKED, requiresDateTime: true, sortOrder: 1 },
      { label: "No Reply", key: "no_reply", metricKey: "no_reply", nextStepKey: "day_8_phone_call", delayDays: 2, setLeadStatus: LeadStatus.WAITING, sortOrder: 2 },
      { label: "Not Interested", key: "not_interested", metricKey: "not_interested", delayDays: 0, isTerminal: true, setLeadStatus: LeadStatus.NOT_INTERESTED, sortOrder: 3 },
    ],
  },
];

async function upsertSetting(key: string, value: Prisma.InputJsonValue) {
  await prisma.appSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "dejan@trucka.local" },
    update: { name: DEFAULT_USER_NAME },
    create: {
      name: DEFAULT_USER_NAME,
      email: "dejan@trucka.local",
    },
  });

  const script = await prisma.script.upsert({
    where: { id: "trucka-carrier-invoice-outreach" },
    update: {},
    create: {
      id: "trucka-carrier-invoice-outreach",
      name: "TruckA Carrier Invoice Outreach",
      description: "Default TruckA carrier invoice outreach workflow.",
      createdById: user.id,
    },
  });

  const existingVersion = await prisma.scriptVersion.findFirst({
    where: {
      scriptId: script.id,
      version: 1,
    },
  });

  const version =
    existingVersion ??
    (await prisma.scriptVersion.create({
      data: {
        scriptId: script.id,
        version: 1,
        name: "TruckA Carrier Invoice Outreach v1",
        description: "Seeded TruckA carrier invoice outreach version.",
        isActive: true,
      },
    }));

  await prisma.scriptVersion.updateMany({
    where: { scriptId: script.id },
    data: { isActive: false },
  });

  await prisma.scriptVersion.update({
    where: { id: version.id },
    data: { isActive: true },
  });

  const existingSteps = await prisma.scriptStep.findMany({
    where: { scriptVersionId: version.id },
    select: { id: true },
  });

  if (existingSteps.length > 0) {
    const stepIds = existingSteps.map((step) => step.id);
    await prisma.scriptOutcome.deleteMany({
      where: { stepId: { in: stepIds } },
    });
    await prisma.scriptStep.deleteMany({
      where: { id: { in: stepIds } },
    });
  }

  const stepIdByKey = new Map<string, string>();

  for (const step of steps) {
    const createdStep = await prisma.scriptStep.create({
      data: {
        scriptVersionId: version.id,
        key: step.key,
        metricKey: step.metricKey,
        name: step.name,
        channel: step.channel,
        subject: step.subject,
        scriptText: step.scriptText,
        instructions: step.instructions,
        sortOrder: step.sortOrder,
        defaultDelayDays: step.defaultDelayDays ?? 0,
        isStartStep: step.isStartStep ?? false,
        isTerminalStep: step.isTerminalStep ?? false,
        positionX: (step.sortOrder % 4) * 320,
        positionY: Math.floor(step.sortOrder / 4) * 200,
      },
    });

    stepIdByKey.set(step.key, createdStep.id);
  }

  for (const step of steps) {
    const stepId = stepIdByKey.get(step.key)!;

    for (const outcome of step.outcomes) {
      await prisma.scriptOutcome.create({
        data: {
          stepId,
          label: outcome.label,
          key: outcome.key,
          metricKey: outcome.metricKey,
          description: outcome.description,
          nextStepId: outcome.nextStepKey
            ? stepIdByKey.get(outcome.nextStepKey)
            : undefined,
          delayDays: outcome.delayDays,
          setLeadStatus: outcome.setLeadStatus,
          isTerminal: outcome.isTerminal ?? false,
          requiresNote: outcome.requiresNote ?? false,
          requiresDateTime: outcome.requiresDateTime ?? false,
          requiresContact: outcome.requiresContact ?? false,
          sortOrder: outcome.sortOrder,
        },
      });
    }
  }

  await upsertSetting(APP_SETTING_KEYS.ACTIVE_SCRIPT_VERSION_ID, version.id);
  await upsertSetting(APP_SETTING_KEYS.DAILY_NEW_LEAD_LIMIT, DEFAULT_DAILY_NEW_LEAD_LIMIT);
  await upsertSetting(APP_SETTING_KEYS.USER_NAME, DEFAULT_USER_NAME);
  await upsertSetting(APP_SETTING_KEYS.COMPANY_NAME, DEFAULT_COMPANY_NAME);
  await upsertSetting(APP_SETTING_KEYS.DEFAULT_TIMEZONE, DEFAULT_TIMEZONE);
  await upsertSetting(APP_SETTING_KEYS.WORKING_DAYS, WORKING_DAYS_DEFAULT);

  const leads = [
    {
      companyName: "ABC Transport",
      contactName: "John Smith",
      email: "john@abctransport.com",
      phone: "555-111-1111",
      ownerId: user.id,
      status: LeadStatus.NEW,
    },
    {
      companyName: "FastLine Carrier",
      contactName: "Sarah Miller",
      email: "sarah@fastlinecarrier.com",
      phone: "555-222-2222",
      ownerId: user.id,
      status: LeadStatus.NEW,
    },
    {
      companyName: "BlueRoad Logistics",
      contactName: "Mike Johnson",
      email: "mike@blueroadlogistics.com",
      phone: "555-333-3333",
      ownerId: user.id,
      status: LeadStatus.NEW,
    },
  ];

  for (const lead of leads) {
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email: lead.email },
          { companyName: lead.companyName, phone: lead.phone },
        ],
      },
    });

    const createdLead = existingLead
      ? await prisma.lead.update({
          where: { id: existingLead.id },
          data: {
            companyName: lead.companyName,
            contactName: lead.contactName,
            email: lead.email,
            phone: lead.phone,
            ownerId: user.id,
            status: LeadStatus.NEW,
          },
        })
      : await prisma.lead.create({
          data: lead,
        });

    const existingActivity = await prisma.activity.findFirst({
      where: {
        leadId: createdLead.id,
        type: "LEAD_CREATED",
      },
    });

    if (!existingActivity) {
      await prisma.activity.create({
        data: {
          leadId: createdLead.id,
          userId: user.id,
          type: "LEAD_CREATED",
          title: "Lead created",
          body: "Seed lead added to the system.",
        },
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
