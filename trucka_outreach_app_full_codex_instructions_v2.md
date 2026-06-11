# TruckA Outreach App — Full Codex Build Instructions

## Purpose

Build a complete internal outreach execution app for Dejan from TruckA Company.

This app is not a generic CRM.

This app is a script-driven outreach workflow engine.

The user should be able to:

1. Create or edit an outreach script.
2. Define every step in the script.
3. Define every possible outcome for every step.
4. Choose what happens next after each outcome.
5. Add leads.
6. Assign leads to the active script.
7. Open a "Start Working" page every day.
8. See exactly what outreach actions are due today.
9. See the exact script to use for each action.
10. Select the outcome after completing the action.
11. Let the system schedule the next step automatically based on the selected outcome.
12. View all contacted leads and their full history.
13. Manually override a lead if the lead replies or changes status.

The main idea:

```text
Lead enters script
↓
System shows today's action
↓
User performs action
↓
User selects outcome
↓
System schedules the next action
↓
Lead appears again on the correct future day
```

The most important product rule:

```text
selected outcome → next step → next task due date
```

That is the core engine of the whole app.

---

# Final Stack

Use this stack:

```text
Next.js
TypeScript
Prisma
PostgreSQL
Tailwind CSS
shadcn/ui
React Hook Form
Zod
date-fns
```

Optional but recommended:

```text
Better Auth or a simple credentials-based local auth
```

Do not use:

```text
Supabase
Firebase
Docker
External workflow engines
Heavy CRM frameworks
```

Use local PostgreSQL.

The local `.env` should look like this:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/trucka_outreach"
```

Use Prisma migrations.

Use the Next.js App Router.

---

# App Name

Use:

```text
TruckA Outreach
```

---

# Core Product Definition

This app is a daily command center for executing TruckA Company's carrier outreach script.

The user should never have to ask:

```text
Who should I contact today?
What should I say?
What did I already do?
When do I follow up?
What happens after this outcome?
```

The app should answer those questions automatically.

---

# Main User

The primary user is:

```text
Dejan from TruckA Company
```

Assume single-user internal use for v1.

However, structure the database with a `User` model so multi-user support can be added later.

---

# Main Entities

The app must contain these core entities:

```text
User
AppSetting
Script
ScriptVersion
ScriptStep
ScriptOutcome
Lead
Task
Activity
JourneyEvent
Note
```

Important concept:

A `Script` can have many `ScriptVersion`s.

A `Lead` is assigned to a specific `ScriptVersion`.

When the script is edited and a new version is created, existing leads should remain on the script version they started with.

New leads should use the currently active script version.

This prevents old leads from breaking when the script changes.

---

# Dynamic Strategy + Metrics-Safe Architecture

This is a critical architecture requirement.

The outreach strategy can change over time.

Example:

```text
A carrier gives a response that the current script does not have a step/outcome for.
```

The app must allow Dejan to handle that situation without breaking:

```text
Existing leads
Historical metrics
Step conversion reporting
Outcome reporting
Failure point reporting
```

The app must be built so that workflow changes are safe.

---

## Core Rule

Never rely only on editable names for metrics.

Every script step and every outcome must have a stable key.

Examples:

```text
day_1_initial_email
day_4_follow_up_email
day_8_phone_call
outcome_no_answer
outcome_voicemail_left
outcome_interested
outcome_wrong_person
outcome_demo_booked
```

Display names can change.

Script text can change.

Instructions can change.

But stable metric keys must not be reused for a different meaning.

---

## Stable Keys

Every `ScriptStep` must have:

```text
key
metricKey
name
```

Every `ScriptOutcome` must have:

```text
key
metricKey
label
```

Use `key` for internal workflow identity.

Use `metricKey` for reporting/grouping.

Example:

```text
Step name: Day 8 Phone Call
Step key: day_8_phone_call
Step metricKey: phone_call_attempt
```

Example:

```text
Outcome label: Voicemail Left
Outcome key: voicemail_left
Outcome metricKey: voicemail_left
```

This allows metrics like:

```text
How many leads failed at phone call?
How many voicemails led to replies?
How many demos led to document requests?
```

Even if the displayed script is later edited.

---

## No Hard Deletes For Published Workflow Items

After a script version is published or active:

```text
Do not hard-delete steps.
Do not hard-delete outcomes.
Do not reuse old keys for a different meaning.
```

Instead, use:

```text
isArchived = true
```

Archived steps/outcomes should not appear as normal options for new editing, but they must remain available for historical metrics and old lead timelines.

---

## Script Versioning Rules

When changing workflow logic, create a new script version.

Workflow logic means changing:

```text
Which outcome points to which next step
Delay days
Terminal status
Lead status changes
Adding a new branch
Removing a branch
Changing the meaning of a step
Changing the meaning of an outcome
```

Rule:

```text
New leads use the currently active script version.
Existing leads stay on the script version they started with.
```

Do not automatically migrate existing leads to the new workflow.

If a lead must be moved to a new version manually, record a migration activity and a journey event.

---

## Editing Modes

The script editor should support these concepts:

### Draft version

Can be freely edited.

### Published/active version

Should be treated as immutable for structural workflow changes.

Allowed safe edits:

```text
Fix typo in script text
Improve instructions
Change display name slightly without changing meaning
```

Unsafe edits should create a new version:

```text
Change outcome routing
Change delay timing
Add/remove branches
Change terminal behavior
Change lead status behavior
```

---

## Handling Unexpected Prospect Responses

Sometimes the prospect will say something that does not match any available outcome.

The app must support:

```text
Other / Custom Outcome
```

When Dejan selects this, the app should allow:

```text
Write what happened
Choose next action manually
Create a one-off manual task
Optionally create a reusable outcome/step for future leads
```

This is important.

Do not force Dejan to choose the wrong outcome just because the script does not have the perfect branch.

---

## Custom Outcome Flow

When completing a task, always show:

```text
Other / Custom Outcome
```

If selected, show a form:

```text
What happened?
What should happen next?
- Create manual task
- Move to existing step
- Stop sequence
- Mark disqualified
- Mark not interested
- Create new reusable branch
```

If the user chooses "Create new reusable branch":

1. Create a new draft script version cloned from the current active version.
2. Add the new outcome and/or new step to that draft version.
3. Let Dejan review and activate the new version.
4. Do not automatically change old leads.
5. For the current lead, either:
   - continue with a one-off manual task, or
   - explicitly migrate this lead to the new script version with a recorded migration event.

---

## Metrics Must Use Snapshots

When a task is created or completed, store snapshots of:

```text
scriptVersionId
scriptVersionNumber
stepId
stepKey
stepMetricKey
stepNameSnapshot
outcomeId
outcomeKey
outcomeMetricKey
outcomeLabelSnapshot
leadStatusAtTime
```

Why?

Because later:

```text
The step may be renamed.
The outcome may be archived.
A new version may be active.
The workflow may be different.
```

But historical reporting must still answer:

```text
At which step did this lead fail?
Which outcome happened?
Which version of the strategy was being used?
```

---

## Journey Events

Add a separate immutable event table for reporting.

Do not depend only on mutable Task or Lead fields for metrics.

The reporting source of truth should be an append-only journey/event log.

Each important moment should create a journey event:

```text
Lead started script
Step entered
Task created
Task completed
Outcome selected
Lead moved to next step
Terminal outcome reached
Manual override
Custom outcome selected
Script version migration
Closed won
Closed lost
Disqualified
```

This allows metrics to remain correct even if the lead's current state changes later.

---

## Metrics Philosophy

Reports should be based on immutable events and stable keys.

Bad:

```text
Count leads where currentStep.name = "Day 8 Phone Call"
```

Good:

```text
Count JourneyEvents where stepMetricKey = "phone_call_attempt"
```

Bad:

```text
Count outcomes by label = "No answer"
```

Good:

```text
Count JourneyEvents where outcomeMetricKey = "no_answer"
```

---

## Required Metrics Later

Do not build a full analytics dashboard in v1, but structure the data so these can be built later:

```text
Conversion rate by script version
Conversion rate by step key
Drop-off rate by step key
Outcome counts by outcome key
How many leads reached demo
How many demos led to document request
How many document requests led to documents received
How many Loom videos led to pilot proposal
How many pilots closed won
Where leads usually fail
Which script version performs better
```

---

## Key Naming Rules

Keys should be lowercase snake_case.

Examples:

```text
day_1_initial_email
day_4_follow_up_email
day_8_phone_call
day_9_after_call_email
day_14_value_email
demo
document_request_email
loom_follow_up
pilot_close
breakup_email
```

Outcome keys:

```text
sent_no_reply_yet
positive_reply
no_answer
voicemail_left
busy_call_back
manual_process_confirmed
already_has_software
wrong_person
gatekeeper
send_me_info
asked_price
asked_if_ai
privacy_concern
demo_booked
documents_received
not_interested
closed_won
closed_lost
disqualified
custom_outcome
```

Never reuse a key for a different meaning.

If the meaning changes, create a new key.

Example:

```text
day_8_phone_call_v2
```

or better:

```text
phone_call_invoice_workflow_check
```

---

## Reporting Snapshot Requirement

When creating an Activity or JourneyEvent, include enough metadata to reconstruct what happened even if the script changes.

Example metadata:

```json
{
  "scriptVersionId": "abc123",
  "scriptVersionNumber": 1,
  "stepId": "step123",
  "stepKey": "day_8_phone_call",
  "stepMetricKey": "phone_call_attempt",
  "stepNameSnapshot": "Day 8 Phone Call",
  "outcomeId": "outcome123",
  "outcomeKey": "voicemail_left",
  "outcomeMetricKey": "voicemail_left",
  "outcomeLabelSnapshot": "Voicemail Left"
}
```

---

## Product Rule

The script can evolve.

The metrics must not be rewritten by that evolution.

Historical leads must always show what happened according to the strategy version and step/outcome keys that existed at the time.

---


---

# Required Pages

Build these pages:

```text
/login
/start-working
/leads
/leads/new
/leads/import
/leads/[id]
/scripts
/scripts/new
/scripts/[id]
/scripts/[id]/steps/new
/scripts/[id]/steps/[stepId]
/settings
```

If auth is skipped for first local version, still keep the route structure ready.

The home page `/` should redirect to `/start-working`.

---

# Navigation

The app should have a left sidebar or top navigation with:

```text
Start Working
Leads
Scripts
Settings
```

The active page should be visually highlighted.

---

# UI Style

Use a clean, practical internal-tool style.

No fancy landing page.

Use:

```text
Cards
Tables
Badges
Tabs
Buttons
Dialogs
Textarea fields
Dropdowns
Date/time pickers
```

Use shadcn/ui components when possible.

The UI should feel like:

```text
Linear + HubSpot-lite + internal operations dashboard
```

Prioritize clarity and speed over decoration.

---

# Prisma Schema Requirements

Create a Prisma schema based on the following structure.

You can adjust minor syntax as needed, but preserve the data model and relationships.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum LeadStatus {
  NEW
  ACTIVE
  WAITING
  DEMO_BOOKED
  DOCUMENTS_REQUESTED
  DOCUMENTS_RECEIVED
  LOOM_SENT
  PILOT_PROPOSED
  CLOSED_WON
  CLOSED_LOST
  DISQUALIFIED
  NOT_INTERESTED
  PAUSED
}

enum TaskStatus {
  OPEN
  COMPLETED
  CANCELLED
  SKIPPED
}

enum TaskPriority {
  LOW
  NORMAL
  HIGH
  URGENT
}

enum StepChannel {
  EMAIL
  PHONE
  VOICEMAIL
  DEMO
  DOCUMENT_REQUEST
  LOOM
  MANUAL
  CLOSE
  BREAKUP
}


enum JourneyEventType {
  LEAD_STARTED
  STEP_ENTERED
  TASK_CREATED
  TASK_COMPLETED
  OUTCOME_SELECTED
  NEXT_STEP_SCHEDULED
  TERMINAL_REACHED
  MANUAL_OVERRIDE
  CUSTOM_OUTCOME_SELECTED
  SCRIPT_VERSION_MIGRATED
  CLOSED_WON
  CLOSED_LOST
  DISQUALIFIED
}

enum ActivityType {
  LEAD_CREATED
  LEAD_STARTED
  TASK_CREATED
  TASK_COMPLETED
  OUTCOME_SELECTED
  EMAIL_SENT
  PHONE_CALL
  VOICEMAIL_LEFT
  DEMO_BOOKED
  DOCUMENTS_REQUESTED
  DOCUMENTS_RECEIVED
  LOOM_SENT
  PILOT_PROPOSED
  STATUS_CHANGED
  NOTE_ADDED
  MANUAL_OVERRIDE
}

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  password  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  leads      Lead[]
  scripts    Script[]
  tasks      Task[]
  activities Activity[]
  journeyEvents JourneyEvent[]
  notes      Note[]
}

model AppSetting {
  id        String   @id @default(cuid())
  key       String   @unique
  value     Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Script {
  id          String   @id @default(cuid())
  name        String
  description String?
  createdById String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  createdBy User? @relation(fields: [createdById], references: [id])
  versions  ScriptVersion[]
}

model ScriptVersion {
  id          String   @id @default(cuid())
  scriptId    String
  version     Int
  name        String
  description String?
  isActive    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  script Script @relation(fields: [scriptId], references: [id], onDelete: Cascade)
  steps  ScriptStep[]
  leads  Lead[]

  @@unique([scriptId, version])
}

model ScriptStep {
  id               String      @id @default(cuid())
  scriptVersionId  String
  name             String
  channel          StepChannel
  subject          String?
  scriptText       String
  instructions     String?
  sortOrder        Int         @default(0)
  isStartStep      Boolean     @default(false)
  isTerminalStep   Boolean     @default(false)
  defaultDelayDays Int         @default(0)
  positionX        Float?
  positionY        Float?
  createdAt        DateTime    @default(now())
  updatedAt        DateTime    @updatedAt

  scriptVersion ScriptVersion @relation(fields: [scriptVersionId], references: [id], onDelete: Cascade)

  outcomesFrom ScriptOutcome[] @relation("StepOutcomes")
  outcomesTo   ScriptOutcome[] @relation("NextStep")

  tasks Task[]

  @@index([scriptVersionId])
  @@unique([scriptVersionId, key])
}

model ScriptOutcome {
  id               String @id @default(cuid())
  stepId           String
  label            String
  key              String
  description      String?
  nextStepId       String?
  delayDays        Int    @default(0)
  setLeadStatus    LeadStatus?
  isTerminal       Boolean @default(false)
  requiresNote     Boolean @default(false)
  requiresDateTime Boolean @default(false)
  requiresContact  Boolean @default(false)
  sortOrder        Int @default(0)
  metadata         Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  step     ScriptStep @relation("StepOutcomes", fields: [stepId], references: [id], onDelete: Cascade)
  nextStep ScriptStep? @relation("NextStep", fields: [nextStepId], references: [id])

  @@index([stepId])
  @@index([nextStepId])
  @@unique([stepId, key])
}

model Lead {
  id               String     @id @default(cuid())
  ownerId          String?
  scriptVersionId  String?
  companyName      String
  contactName      String?
  email            String?
  phone            String?
  role             String?
  website          String?
  source           String?
  status           LeadStatus @default(NEW)
  currentStepId    String?
  nextTaskAt       DateTime?
  lastContactedAt  DateTime?
  startedAt        DateTime?
  completedAt      DateTime?
  tags             Json?
  customFields     Json?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  owner         User? @relation(fields: [ownerId], references: [id])
  scriptVersion ScriptVersion? @relation(fields: [scriptVersionId], references: [id])

  tasks      Task[]
  activities Activity[]
  journeyEvents JourneyEvent[]
  notes      Note[]

  @@index([status])
  @@index([nextTaskAt])
  @@index([companyName])
  @@index([email])
}

model Task {
  id                 String     @id @default(cuid())
  leadId             String
  userId             String?
  stepId             String?
  title              String
  description        String?
  dueAt              DateTime
  status             TaskStatus @default(OPEN)
  priority           TaskPriority @default(NORMAL)
  completedAt        DateTime?
  completedOutcomeId String?
  completedNote      String?
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])
  step ScriptStep? @relation(fields: [stepId], references: [id])

  @@index([dueAt])
  @@index([status])
  @@index([leadId])
}

model Activity {
  id        String       @id @default(cuid())
  leadId    String
  userId    String?
  type      ActivityType
  title     String
  body      String?
  metadata  Json?
  createdAt DateTime @default(now())

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])

  @@index([leadId])
  @@index([createdAt])
}


model JourneyEvent {
  id        String @id @default(cuid())
  leadId    String
  userId    String?

  type      JourneyEventType

  // Stable reporting references.
  scriptVersionIdSnapshot String?
  scriptVersionNumberSnapshot Int?

  stepIdSnapshot String?
  stepKey String?
  stepMetricKey String?
  stepNameSnapshot String?

  outcomeIdSnapshot String?
  outcomeKey String?
  outcomeMetricKey String?
  outcomeLabelSnapshot String?

  leadStatusSnapshot LeadStatus?

  title     String
  body      String?
  metadata  Json?

  occurredAt DateTime @default(now())

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])

  @@index([leadId])
  @@index([type])
  @@index([stepKey])
  @@index([stepMetricKey])
  @@index([outcomeKey])
  @@index([outcomeMetricKey])
  @@index([occurredAt])
}

model Note {
  id        String   @id @default(cuid())
  leadId    String
  userId    String?
  body      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  lead Lead @relation(fields: [leadId], references: [id], onDelete: Cascade)
  user User? @relation(fields: [userId], references: [id])

  @@index([leadId])
}
```

---

# Environment Setup Instructions

Codex should create the app so that these commands work:

```bash
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

The app should run at:

```text
http://localhost:3000
```

Add scripts to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  }
}
```

Use `tsx` for seed scripts.

---

# Required App Logic

## 1. Active Script Version

The app should have one active script version.

Store the active script version in `AppSetting`:

```json
{
  "key": "activeScriptVersionId",
  "value": "script_version_id_here"
}
```

When a new lead is started, assign the active script version to that lead.

Existing leads should keep their assigned script version.

## 2. Daily New Lead Limit

Store daily new lead limit in `AppSetting`:

```json
{
  "key": "dailyNewLeadLimit",
  "value": 10
}
```

The `/start-working` page should show up to this number of NEW leads under a "New Leads" section.

These are leads that have not entered the script yet.

The user can click:

```text
Start Outreach
```

That creates the first task for the active script start step.

## 3. Starting a Lead

When the user clicks "Start Outreach" for a new lead:

1. Find active script version.
2. Find the step where `isStartStep = true`.
3. Assign the lead to that script version.
4. Set lead status to `ACTIVE`.
5. Set lead `startedAt = now`.
6. Create a task for the start step with `dueAt = now`.
7. Create activity:

```text
Lead started script
```

## 4. Completing a Task

Every task card should have outcome buttons.

When the user selects an outcome:

1. Mark current task as completed.
2. Store selected outcome ID.
3. Store optional completion note.
4. Add activity record.
5. Update lead status if the outcome defines `setLeadStatus`.
6. If outcome has `nextStepId`, create a new task for that next step.
7. Due date should be `now + outcome.delayDays`, unless the outcome requires a specific date/time.
8. Update lead `currentStepId`.
9. Update lead `nextTaskAt`.
10. If the outcome is terminal, do not create another task.
11. If the outcome is terminal, set `completedAt` if appropriate.

This should happen in a database transaction.

## 5. Manual Override

On a lead detail page, the user must be able to:

```text
Change status
Assign to another step
Create a manual task
Add a note
Mark documents received
Mark demo booked
Mark closed won
Mark closed lost
Pause lead
```

Every manual override should create an Activity record.

## 6. Lead Timeline

Every lead detail page must show a chronological timeline.

Timeline should include:

```text
Lead created
Lead started
Task created
Task completed
Outcome selected
Email sent
Phone call result
Voicemail left
Demo booked
Documents requested
Documents received
Loom sent
Pilot proposed
Status changed
Notes
Manual overrides
```

Newest first is preferred.

---

# Start Working Page

This is the most important page in the app.

Route:

```text
/start-working
```

The page should show a daily work command center.

## Top Summary Cards

Show cards:

```text
Open tasks due today
Overdue tasks
New leads available
Demos / document follow-ups
Total active leads
```

## Work Sections

Show tasks in this priority order:

### 1. Overdue Tasks

All open tasks where:

```text
dueAt < today start
```

### 2. Due Today

All open tasks where:

```text
dueAt is today
```

### 3. High-Value Follow-Ups

Tasks with channels:

```text
DEMO
DOCUMENT_REQUEST
LOOM
CLOSE
```

These are warmer tasks and should be visually highlighted.

### 4. New Leads

Show up to `dailyNewLeadLimit` NEW leads.

Each new lead should have:

```text
Start Outreach
```

button.

---

# Task Card UI

Every task card should show:

```text
Company name
Contact name
Email
Phone
Lead status
Task title
Due date
Step name
Channel
Subject line if email
Script text
Instructions
Outcome buttons
Notes field
```

For phone tasks, show phone number prominently.

For email tasks, show email address and subject line prominently.

---

# Outcome Button UI

Each outcome should be a button.

When clicked:

1. If outcome requires no extra input, complete the task immediately after confirmation.
2. If outcome requires note, show textarea.
3. If outcome requires date/time, show date-time input.
4. If outcome requires contact, show fields:

```text
Name
Email
Phone
Role
Notes
```

Then complete task.

After completion, show success message:

```text
Next step scheduled: [Step Name] on [Date]
```

If terminal:

```text
Lead marked as [Status]. No next task scheduled.
```

---

# Leads Page

Route:

```text
/leads
```

Display a searchable/filterable table.

Columns:

```text
Company
Contact
Email
Phone
Status
Current step
Next task date
Last contacted
Created
```

Filters:

```text
Status
Script
Due today
Overdue
No next task
Search by company/contact/email/phone
```

Actions:

```text
View lead
Edit lead
Start outreach
Create manual task
```

---

# New Lead Page

Route:

```text
/leads/new
```

Fields:

```text
Company name - required
Contact name
Email
Phone
Role
Website
Source
Notes
Tags
```

After saving:

```text
Stay on lead page
or
Create another lead
```

---

# Lead Import Page

Route:

```text
/leads/import
```

For v1, support CSV paste/import.

The user should be able to paste CSV with headers:

```text
companyName,contactName,email,phone,role,website,source
```

Validate rows.

Show preview.

Import valid rows.

Do not import duplicates if email already exists or same company + phone exists.

---

# Lead Detail Page

Route:

```text
/leads/[id]
```

Must show:

## Header

```text
Company name
Contact name
Status badge
Phone
Email
Website
Current step
Next task date
```

## Quick Actions

```text
Create task
Add note
Change status
Assign step
Mark demo booked
Mark documents received
Mark closed won
Mark closed lost
Pause lead
```

## Current Task

If open task exists, show task card with script and outcomes.

## Timeline

Show activities and notes.

## Lead Details

Show all fields and custom fields.

---

# Scripts Page

Route:

```text
/scripts
```

Show all scripts.

Columns:

```text
Name
Active version
Number of steps
Created
Updated
Is active
```

Actions:

```text
View
Edit
Create new version
Set active
```

---

# Script Detail Page

Route:

```text
/scripts/[id]
```

Show:

```text
Script name
Versions
Active version badge
Steps list
Outcomes for each step
```

The user should be able to:

```text
Add step
Edit step
Delete step if unused
Add outcome
Edit outcome
Set start step
Set active version
Create new version
```

For v1, use a form/list builder.

Do not require visual chart builder for v1.

However, store `positionX` and `positionY` in the database for future React Flow support.

---

# Step Form

A script step should have:

```text
Name
Channel
Subject
Script text
Instructions
Default delay days
Start step checkbox
Terminal step checkbox
Sort order
```

Channels:

```text
EMAIL
PHONE
VOICEMAIL
DEMO
DOCUMENT_REQUEST
LOOM
MANUAL
CLOSE
BREAKUP
```

---

# Outcome Form

An outcome should have:

```text
Label
Key
Description
Next step
Delay days
Set lead status
Is terminal
Requires note
Requires date/time
Requires contact
Sort order
```

Examples:

```text
Label: No Reply
Next Step: Day 4 Follow-Up Email
Delay Days: 3
Set Lead Status: WAITING
```

```text
Label: Voicemail Left
Next Step: Day 9 Email After Call Attempt
Delay Days: 1
Set Lead Status: WAITING
```

```text
Label: Demo Booked
Next Step: Demo
Delay Days: 0
Requires date/time: true
Set Lead Status: DEMO_BOOKED
```

```text
Label: Not Interested
Next Step: null
Is Terminal: true
Set Lead Status: NOT_INTERESTED
```

---

# Settings Page

Route:

```text
/settings
```

Settings:

```text
Active script version
Daily new lead limit
User name
Company name
Default timezone
Working days
```

Default values:

```text
Company name: TruckA Company
User name: Dejan
Daily new lead limit: 10
Timezone: Europe/Belgrade
```

---

# Default Seed Data

Create seed data so the app is usable immediately.

Seed:

```text
User: Dejan
Company: TruckA Company
Active script: TruckA Carrier Invoice Outreach v1
Daily new lead limit: 10
```

Seed these example leads:

```text
ABC Transport - John Smith - john@abctransport.com - 555-111-1111
FastLine Carrier - Sarah Miller - sarah@fastlinecarrier.com - 555-222-2222
BlueRoad Logistics - Mike Johnson - mike@blueroadlogistics.com - 555-333-3333
```

---

# Default Outreach Script Seed

Create a default script called:

```text
TruckA Carrier Invoice Outreach
```

Create version:

```text
TruckA Carrier Invoice Outreach v1
```

Set it active.

## Seed Steps and Outcomes

Codex should seed at least these steps and outcomes. The script text should be editable in the UI after seeding.

### Step 1: Day 1 Initial Email

Channel: `EMAIL`

Subject:

```text
Invoice question
```

Script text:

```text
Hi {{contactName}},

Are you currently creating invoices manually from Rate Cons and BOLs?

I'm Dejan from TruckA Company. We're working with carriers to automate that process and reduce the time it takes to invoice brokers after delivery.

Would it be worth a quick conversation?

-Dejan from TruckA Company
```

Instructions:

```text
Goal: Get a conversation. Do not explain more. Do not attach anything. Do not mention AI.
```

Outcomes:

```text
Sent / No Reply Yet → Day 4 Follow-Up Email, delay 3 days, status WAITING
Positive Reply → Qualify Positive Reply, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
Bad Contact Info → terminal, status DISQUALIFIED
```

### Step 2: Qualify Positive Reply

Channel: `EMAIL`

Subject:

```text
Re: Invoice question
```

Script text:

```text
Thanks {{contactName}}.

Just so I understand your process:

Who handles invoicing today?
Roughly how many invoices do you create each month?
Are invoices created manually from Rate Cons and BOLs?

Happy to show you a quick 15-minute demo.

-Dejan from TruckA Company
```

Outcomes:

```text
Answered Questions → Book Demo Ask, delay 0 days, status ACTIVE
Asked For More Info → Send Short Info, delay 0 days, status ACTIVE
No Reply After Qualification → Follow Up Qualification, delay 2 days, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 3: Day 4 Follow-Up Email

Channel: `EMAIL`

Subject:

```text
Re: Invoice question
```

Script text:

```text
Hi {{contactName}},

Following up on my previous email.

Most carriers we speak with still have someone manually transferring load information from Rate Cons and BOLs into invoices.

At TruckA Company, we're helping automate that step so invoices can be sent to brokers faster.

Interested in seeing a quick example?

-Dejan from TruckA Company
```

Outcomes:

```text
Sent / No Reply Yet → Day 8 Phone Call, delay 4 days, status WAITING
Positive Reply → Ask Current Invoice Process, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
Bad Contact Info → terminal, status DISQUALIFIED
```

### Step 4: Ask Current Invoice Process

Channel: `EMAIL`

Subject:

```text
Re: Invoice question
```

Script text:

```text
Curious, how are you creating invoices today?

-Dejan from TruckA Company
```

Outcomes:

```text
Explained Manual Process → Book Demo Ask, delay 0 days, status ACTIVE
Already Automated → terminal, status DISQUALIFIED
No Reply → Follow Up Current Process, delay 2 days, status WAITING
```

### Step 5: Day 8 Phone Call

Channel: `PHONE`

Script text:

```text
Hi {{contactName}},

This is Dejan from TruckA Company.

I sent you an email a few days ago about invoice automation for carriers.

Did I catch you at a bad time?
```

Instructions:

```text
Formula: Context → Permission → Problem Question → Qualification → Next Step.

After the opener, stop and let them answer.

If they say no, ask:
"Perfect, I'll be brief. Quick question — are invoices still being created manually from Rate Cons and BOLs?"

Do not pitch for 5 minutes.
```

Outcomes:

```text
No Answer → Day 9 Email After Call Attempt, delay 1 day, status WAITING
Voicemail Left → Day 9 Email After Call Attempt, delay 1 day, status WAITING
Busy - Call Back → Day 8 Callback, requires date/time, status ACTIVE
Interested → Phone Qualification, delay 0 days, status ACTIVE
Manual Process Confirmed → Book Demo Ask, delay 0 days, status ACTIVE
Already Has Software → Software Objection Handling, delay 0 days, status ACTIVE
Wrong Person → Wrong Person Handling, delay 0 days, requires contact, status ACTIVE
Gatekeeper → Gatekeeper Handling, delay 0 days, status ACTIVE
Send Me Info → Send Short Info, delay 0 days, status ACTIVE
Asked Price → Price Handling, delay 0 days, status ACTIVE
Asked If AI → AI Handling, delay 0 days, status ACTIVE
Document Privacy Concern → Privacy Handling, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 6: Day 8 Callback

Channel: `PHONE`

Script text:

```text
Hi {{contactName}},

This is Dejan from TruckA Company.

You asked me to call back around this time.

Quick question — are invoices still being created manually from Rate Cons and BOLs?
```

Outcomes:

```text
No Answer → Day 9 Email After Call Attempt, delay 1 day, status WAITING
Voicemail Left → Day 9 Email After Call Attempt, delay 1 day, status WAITING
Manual Process Confirmed → Book Demo Ask, delay 0 days, status ACTIVE
Interested → Phone Qualification, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 7: Phone Qualification

Channel: `PHONE`

Script text:

```text
Got it.

Roughly how many invoices are you creating per month?

And who usually creates them?

Are they created directly from Rate Cons and BOLs, or do you use another system first?

That makes sense.

This is exactly the workflow TruckA Company is focused on.

Would it be useful if I showed you a quick 15-minute demo of how a Rate Con and BOL become an invoice?
```

Outcomes:

```text
Demo Accepted → Demo, requires date/time, status DEMO_BOOKED
Demo Hesitation → Demo Hesitation Handling, delay 0 days, status ACTIVE
Not Enough Volume → terminal, status DISQUALIFIED
Not Interested → terminal, status NOT_INTERESTED
```

### Step 8: Software Objection Handling

Channel: `PHONE`

Script text:

```text
That makes sense.

Most carriers we talk to already have some invoicing or accounting system.

The manual part is usually before that — pulling details from Rate Cons and BOLs and making sure the invoice is correct.

Is that part automated for you, or does someone still review and enter those details manually?
```

Outcomes:

```text
Manual Part Still Exists → Book Demo Ask, delay 0 days, status ACTIVE
Fully Automated → terminal, status DISQUALIFIED
Not Interested → terminal, status NOT_INTERESTED
```

### Step 9: Wrong Person Handling

Channel: `MANUAL`

Script text:

```text
Got it.

Who would be the right person to ask about how invoices are created from Rate Cons and BOLs?

Perfect.

Would you mind pointing me to the best email or phone number for them?
```

Outcomes:

```text
Got Correct Contact → New Contact Intro Email, delay 0 days, requires contact, status ACTIVE
No Contact Available → General Follow-Up, delay 1 day, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 10: Gatekeeper Handling

Channel: `PHONE`

Script text:

```text
Hi, this is Dejan from TruckA Company.

I'm trying to reach the person who handles invoicing or billing for your loads.

Who would be the best person to speak with?

If they ask what it is regarding:

It's about reducing the manual work of creating invoices from Rate Cons and BOLs.

If they ask if it is sales:

I'm reaching out to see if the invoice workflow is still manual and whether TruckA Company could help.

Who usually handles billing there?
```

Outcomes:

```text
Transferred To Right Person → Day 8 Phone Call, delay 0 days, status ACTIVE
Got Correct Contact → New Contact Intro Email, delay 0 days, requires contact, status ACTIVE
No Info Given → Day 9 Email After Call Attempt, delay 1 day, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 11: Send Short Info

Channel: `EMAIL`

Subject:

```text
TruckA Company invoice workflow
```

Script text:

```text
{{contactName}},

Thanks for taking my call.

Quick summary:

TruckA Company helps carriers create invoices faster from Rate Cons and BOLs.

The main thing we help with is reducing the manual work of opening documents, copying load details, checking amounts, and creating invoices.

If invoice creation is still manual for your team, I think it would be worth showing you a quick example.

-Dejan from TruckA Company
```

Outcomes:

```text
Sent → Follow Up After Info, delay 2 days, status WAITING
Positive Reply → Book Demo Ask, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 12: Price Handling

Channel: `PHONE`

Script text:

```text
It depends on volume and setup, but for early customers we're keeping it simple and starting with a 30-day pilot.

Before pricing matters, the main question is whether TruckA Company can actually save your team time on invoice creation.

Are invoices currently created manually from Rate Cons and BOLs?
```

Outcomes:

```text
Continues Conversation → Phone Qualification, delay 0 days, status ACTIVE
Still Wants Demo → Demo, requires date/time, status DEMO_BOOKED
Not Interested → terminal, status NOT_INTERESTED
```

### Step 13: AI Handling

Channel: `PHONE`

Script text:

```text
There is automation behind it, but the main point is simple:

TruckA Company helps turn Rate Cons and BOLs into invoices so your team doesn't have to retype everything manually.

The result matters more than the technology.

Is invoice creation still manual for your team today?
```

Outcomes:

```text
Manual Process Confirmed → Book Demo Ask, delay 0 days, status ACTIVE
Still Concerned → Send Short Info, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 14: Privacy Handling

Channel: `PHONE`

Script text:

```text
Completely understand.

For the test, you can redact anything sensitive.

We only need enough information to see whether the workflow works:

load details
dates
amounts
broker/customer fields
pickup and delivery information

The point is not to get private information.

The point is to prove whether TruckA Company can create accurate invoices from the same documents your team already uses.

Would sending 3-5 redacted examples be comfortable?
```

Outcomes:

```text
Agrees To Documents → Document Request Email, delay 0 days, status DOCUMENTS_REQUESTED
Wants Demo First → Demo, requires date/time, status DEMO_BOOKED
Not Comfortable → Follow Up Privacy, delay 2 days, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 15: Book Demo Ask

Channel: `MANUAL`

Script text:

```text
That makes sense.

I think it would be easier to show you than explain it.

Would you be open to a quick 15-minute demo where I show how TruckA Company turns a Rate Con and BOL into an invoice?

-Dejan from TruckA Company
```

Outcomes:

```text
Demo Booked → Demo, requires date/time, status DEMO_BOOKED
Asked For Info First → Send Short Info, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
No Reply → Follow Up Demo Ask, delay 2 days, status WAITING
```

### Step 16: Demo

Channel: `DEMO`

Script text:

```text
{{contactName}}, appreciate you taking the time.

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

You can redact anything sensitive if needed.
```

Outcomes:

```text
Documents Requested → Document Request Email, delay 0 days, status DOCUMENTS_REQUESTED
Needs Time To Think → Think About It Follow-Up, delay 2 days, status WAITING
Not A Fit → terminal, status DISQUALIFIED
Not Interested → terminal, status NOT_INTERESTED
```

### Step 17: Document Request Email

Channel: `DOCUMENT_REQUEST`

Subject:

```text
Documents for TruckA Company workflow test
```

Script text:

```text
{{contactName}},

Thanks for taking the time today.

For the workflow test, please send:

3-5 recent Rate Cons
The matching BOLs
Any invoice template or example invoice you currently use, if available

You can redact anything sensitive if needed.

I'll use these to test how TruckA Company handles your actual invoice workflow and send you a short video showing the results.

-Dejan from TruckA Company
```

Outcomes:

```text
Sent / Waiting For Documents → Follow Up For Documents, delay 2 days, status DOCUMENTS_REQUESTED
Documents Received → Create Loom From Documents, delay 0 days, status DOCUMENTS_RECEIVED
Not Interested → terminal, status NOT_INTERESTED
```

### Step 18: Follow Up For Documents

Channel: `EMAIL`

Subject:

```text
Re: Documents for TruckA Company workflow test
```

Script text:

```text
{{contactName}},

Wanted to follow up on the workflow test.

If it's easier, you can send 2-3 redacted Rate Cons and matching BOLs to start.

The goal is just to show whether TruckA Company can create invoices from the same paperwork your team already uses.

-Dejan from TruckA Company
```

Outcomes:

```text
Documents Received → Create Loom From Documents, delay 0 days, status DOCUMENTS_RECEIVED
Still Waiting → Breakup Email, delay 5 days, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 19: Create Loom From Documents

Channel: `LOOM`

Script text:

```text
Record a Loom video.

Say:

{{contactName}},

I used three of your recent loads.

Here's exactly how they were processed.

Invoice #1 took 12 seconds.
Invoice #2 took 14 seconds.
Invoice #3 took 11 seconds.

This is the same workflow your team is doing manually today.

TruckA Company turns the Rate Con and BOL into an invoice without your team retyping the load details.

The main question is whether this would save your team time every week.
```

Outcomes:

```text
Loom Sent → 48-Hour Loom Follow-Up, delay 2 days, status LOOM_SENT
Need More Documents → Document Request Email, delay 0 days, status DOCUMENTS_REQUESTED
Not A Fit → terminal, status DISQUALIFIED
```

### Step 20: 48-Hour Loom Follow-Up

Channel: `EMAIL`

Subject:

```text
Re: TruckA Company workflow test
```

Script text:

```text
{{contactName}},

Based on the test, do you think this would save your team time every week?

-Dejan from TruckA Company
```

Outcomes:

```text
Acknowledged Value → Pilot Close, delay 0 days, status ACTIVE
Needs Team Review → Team Review Follow-Up, delay 2 days, status WAITING
No Reply → Post-Loom Follow-Up, delay 2 days, status WAITING
Not Interested → terminal, status NOT_INTERESTED
```

### Step 21: Pilot Close

Channel: `CLOSE`

Script text:

```text
That makes sense.

I'd like to onboard you as an early customer for TruckA Company.

We'll handle setup and invoice templates for you.

Would you like to start with a 30-day pilot?

-Dejan from TruckA Company
```

Outcomes:

```text
Pilot Accepted → terminal, status CLOSED_WON
Needs To Think → Think About It Follow-Up, delay 2 days, status WAITING
Price Objection → Price Objection Close, delay 0 days, status ACTIVE
Not Interested → terminal, status CLOSED_LOST
```

### Step 22: Price Objection Close

Channel: `CLOSE`

Script text:

```text
I understand.

That's why I think starting with a 30-day pilot makes more sense than a long commitment.

The goal is to prove the time savings first.

If it doesn't save your team time, then it doesn't make sense to continue.

Would a 30-day pilot be a reasonable way to test that?
```

Outcomes:

```text
Pilot Accepted → terminal, status CLOSED_WON
Still Unsure → Think About It Follow-Up, delay 2 days, status WAITING
Not Interested → terminal, status CLOSED_LOST
```

### Step 23: Think About It Follow-Up

Channel: `EMAIL`

Subject:

```text
Re: TruckA Company
```

Script text:

```text
{{contactName}},

Thanks again.

I'll give you some time to review.

The main thing to consider is whether the test showed that TruckA Company can save your team time creating invoices from Rate Cons and BOLs.

I'll follow up in a couple of days.

-Dejan from TruckA Company
```

Outcomes:

```text
Sent → Final Decision Follow-Up, delay 3 days, status WAITING
Positive Reply → Pilot Close, delay 0 days, status ACTIVE
Not Interested → terminal, status CLOSED_LOST
```

### Step 24: Final Decision Follow-Up

Channel: `EMAIL`

Subject:

```text
Re: TruckA Company
```

Script text:

```text
{{contactName}},

Should I assume this is not a priority right now?

No problem either way.

-Dejan from TruckA Company
```

Outcomes:

```text
Positive Reply → Pilot Close, delay 0 days, status ACTIVE
No Reply → Breakup Email, delay 3 days, status WAITING
Not Interested → terminal, status CLOSED_LOST
```

### Step 25: Day 9 Email After Call Attempt

Channel: `EMAIL`

Subject:

```text
Tried reaching you
```

Script text:

```text
{{contactName}},

Tried reaching you today.

Curious if invoice creation is still a manual process for your team.

If so, I think what we're building at TruckA Company could be useful.

Happy to show you.

-Dejan from TruckA Company
```

Outcomes:

```text
Sent / No Reply Yet → Day 14 Value Email, delay 5 days, status WAITING
Positive Reply → Ask Current Invoice Process, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 26: Day 14 Value Email

Channel: `EMAIL`

Subject:

```text
Invoice time
```

Script text:

```text
{{contactName}},

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

-Dejan from TruckA Company
```

Outcomes:

```text
Sent / No Reply Yet → Breakup Email, delay 7 days, status WAITING
Positive Reply → Ask Current Invoice Process, delay 0 days, status ACTIVE
Not Interested → terminal, status NOT_INTERESTED
```

### Step 27: Breakup Email

Channel: `BREAKUP`

Subject:

```text
Closing the loop
```

Script text:

```text
{{contactName}},

I've reached out a few times and haven't heard back.

I'll assume invoice automation isn't a priority right now.

If that changes later, feel free to reach out.

Best,

Dejan from TruckA Company
```

Outcomes:

```text
Sent / No Reply → terminal, status CLOSED_LOST
Positive Reply → Ask Current Invoice Process, delay 0 days, status ACTIVE
```

---

# Template Variables

Script text should support simple variables:

```text
{{contactName}}
{{companyName}}
{{email}}
{{phone}}
{{userName}}
{{companySenderName}}
```

For v1, variable rendering can be simple string replacement.

Defaults:

```text
{{userName}} = Dejan
{{companySenderName}} = TruckA Company
```

If `contactName` is missing, use:

```text
there
```

Example:

```text
Hi {{contactName}},
```

becomes:

```text
Hi there,
```

---

# Workflow Engine Details

## Metrics-Safe Completion Logic

When completing a task, the app must create both:

```text
Activity record for human-readable timeline
JourneyEvent record for immutable metrics/reporting
```

The JourneyEvent must store snapshots of the step and outcome keys at the time of the action.

Do not calculate historical metrics from the current editable script step name.

Calculate metrics from JourneyEvent stable keys.

If the user selects `Other / Custom Outcome`, create:

```text
JourneyEvent type: CUSTOM_OUTCOME_SELECTED
outcomeKey: custom_outcome
outcomeMetricKey: custom_outcome
body: user's explanation
metadata: chosen manual next action
```

If the custom outcome becomes a reusable branch, create a new script version and record:

```text
JourneyEvent type: SCRIPT_VERSION_MIGRATED
```

only if the current lead is explicitly moved to that new version.



Create a service file:

```text
lib/workflow.ts
```

It should export functions:

```ts
startLead(leadId: string, userId?: string): Promise<void>

completeTaskWithOutcome(input: {
  taskId: string
  outcomeId: string
  userId?: string
  note?: string
  scheduledAt?: Date
  contact?: {
    name?: string
    email?: string
    phone?: string
    role?: string
  }
}): Promise<void>

createManualTask(input: {
  leadId: string
  stepId?: string
  title: string
  dueAt: Date
  description?: string
  userId?: string
}): Promise<void>

manualOverrideLead(input: {
  leadId: string
  status?: LeadStatus
  stepId?: string
  nextTaskAt?: Date
  note?: string
  userId?: string
}): Promise<void>
```

The `completeTaskWithOutcome` function is the most important function in the app.

It must use `prisma.$transaction`.

Pseudo-logic:

```ts
const task = await tx.task.findUnique({
  where: { id: taskId },
  include: {
    lead: true,
    step: true
  }
})

const outcome = await tx.scriptOutcome.findUnique({
  where: { id: outcomeId },
  include: {
    nextStep: true
  }
})

mark task completed

create activity
create journey event with step/outcome snapshots

if outcome.setLeadStatus:
  update lead status

if outcome.isTerminal:
  update lead completedAt
  update lead nextTaskAt null
  return

if outcome.nextStepId:
  dueAt = scheduledAt ?? addDays(new Date(), outcome.delayDays)
  create new task
  update lead currentStepId and nextTaskAt
  create activity TASK_CREATED
```

---

# Date Logic

Use `date-fns`.

For due dates:

```text
delayDays = 0 → due immediately
delayDays = 1 → tomorrow
delayDays = 3 → three days from now
```

For `/start-working`, consider tasks due if:

```text
task.status = OPEN
and task.dueAt <= endOfToday
```

Overdue:

```text
task.status = OPEN
and task.dueAt < startOfToday
```

Use timezone:

```text
Europe/Belgrade
```

For v1, local server timezone is acceptable, but keep timezone setting stored.

---

# Component Requirements

Create reusable components:

```text
components/app-shell.tsx
components/sidebar.tsx
components/task-card.tsx
components/outcome-buttons.tsx
components/lead-status-badge.tsx
components/lead-table.tsx
components/activity-timeline.tsx
components/script-step-card.tsx
components/script-outcome-list.tsx
components/page-header.tsx
components/empty-state.tsx
components/confirm-dialog.tsx
```

---

# Server Actions / API Requirements

Use Server Actions or API routes.

Recommended files:

```text
app/actions/leads.ts
app/actions/tasks.ts
app/actions/scripts.ts
app/actions/settings.ts
```

Actions:

```ts
createLead
updateLead
importLeads
startLeadAction
completeTaskAction
createManualTaskAction
addNoteAction
changeLeadStatusAction
createScriptAction
createScriptStepAction
createScriptOutcomeAction
setActiveScriptVersionAction
updateSettingsAction
```

Use Zod validation for inputs.

---

# Search and Filters

Implement lead search.

Search fields:

```text
companyName
contactName
email
phone
```

Filters:

```text
status
dueToday
overdue
scriptVersion
```

---

# Status Badges

Use readable labels:

```text
NEW → New
ACTIVE → Active
WAITING → Waiting
DEMO_BOOKED → Demo Booked
DOCUMENTS_REQUESTED → Documents Requested
DOCUMENTS_RECEIVED → Documents Received
LOOM_SENT → Loom Sent
PILOT_PROPOSED → Pilot Proposed
CLOSED_WON → Closed Won
CLOSED_LOST → Closed Lost
DISQUALIFIED → Disqualified
NOT_INTERESTED → Not Interested
PAUSED → Paused
```

---

# Task Priority Rules

Default priority:

```text
NORMAL
```

High priority if channel is:

```text
DEMO
DOCUMENT_REQUEST
LOOM
CLOSE
```

Urgent if overdue and high-value.

---

# Empty States

Add useful empty states.

Examples:

If no tasks due:

```text
No tasks due today. You can start new leads or review active leads.
```

If no leads:

```text
No leads yet. Add your first carrier lead to start outreach.
```

If no scripts:

```text
No scripts yet. Create a script or run the seed command.
```

---

# Validation Rules

Lead:

```text
companyName required
email optional but must be valid if present
phone optional
```

Script step:

```text
name required
channel required
scriptText required
```

Outcome:

```text
label required
key required
nextStep required unless terminal
terminal outcome must set lead status
delayDays cannot be negative
```

Task:

```text
title required
dueAt required
lead required
```

---

# Error Handling

Show clear toast messages:

```text
Lead created
Lead started
Task completed
Next step scheduled
Lead marked as not interested
Settings saved
Script set active
Something went wrong
```

Do not silently fail.

---

# Important UX Details

## Copy Script Button

Every task card should have:

```text
Copy script
```

button.

When clicked, copy rendered script text with variables replaced.

## Email Copy Button

For email tasks, show:

```text
Copy subject
Copy email body
```

## Phone Tasks

For phone tasks, show:

```text
Call {{phone}}
```

as a clickable `tel:` link if phone exists.

## Email Tasks

For email tasks, show:

```text
Email {{email}}
```

as a clickable `mailto:` link with subject and body prefilled if possible.

## Notes

Every task completion should allow optional notes.

---

# No Email Sending in v1

Do not integrate email sending yet.

For v1, the user manually sends emails.

The app only provides:

```text
Subject
Body
Copy button
mailto link
Outcome selection
```

Later, email sending can be added.

---

# No Phone Integration in v1

Do not integrate Twilio yet.

For v1, the user manually calls.

The app only provides:

```text
Phone number
tel link
Phone script
Outcome selection
Call notes
```

---

# No AI in v1

Do not use AI in v1.

The app should be deterministic.

The script defines what happens next.

No AI recommendations are needed.

---

# Future Features To Leave Room For

Do not build these now, but structure the app so they can be added later:

```text
React Flow visual script builder
Email sending integration
Gmail reply detection
Twilio call logging
Calendar integration
AI reply classification
Team users
Analytics dashboard
A/B testing scripts
Lead enrichment
```

---

# Acceptance Criteria

The app is complete when all of these work:

## Setup

```text
npm install works
npx prisma migrate dev works
npx prisma db seed works
npm run dev works
```

## Seed

After seeding:

```text
Default user exists
Default settings exist
Default TruckA script exists
Default script version is active
Default script has all major steps and outcomes
Example leads exist
```

## Start Working

The user can:

```text
Open /start-working
See due tasks
See overdue tasks
See new leads
Start a new lead
Complete a task
Select an outcome
See the next task created automatically
```

## Lead Flow

The user can:

```text
Create a lead
Start outreach
Complete Day 1 email
Schedule Day 4 follow-up
Complete Day 4 follow-up
Schedule Day 8 phone call
Select voicemail outcome
Schedule Day 9 email
Book demo
Request documents
Mark documents received
Send Loom
Close pilot
```

## Lead Detail

The user can:

```text
View lead info
View current task
View timeline
Add note
Create manual task
Change status
Override current step
```

## Script Management

The user can:

```text
View scripts
View script steps
Create a script
Create steps
Create outcomes
Set active script version
```

## Settings

The user can:

```text
Set active script
Set daily new lead limit
Update user/company defaults
```

---


## Dynamic Strategy / Metrics Safety

The user can:

```text
Complete a task using Other / Custom Outcome
Create a one-off manual next task from a custom outcome
Create a new reusable branch without breaking existing leads
Create a new script version when workflow logic changes
Keep old leads on their original script version
See historical lead timeline even after steps/outcomes are archived
Store stable step/outcome keys in JourneyEvent records
Know where a lead failed even if the step was renamed or archived later
```


# Suggested Folder Structure

Use this structure:

```text
app/
  layout.tsx
  page.tsx
  globals.css

  start-working/
    page.tsx

  leads/
    page.tsx
    new/
      page.tsx
    import/
      page.tsx
    [id]/
      page.tsx

  scripts/
    page.tsx
    new/
      page.tsx
    [id]/
      page.tsx
      steps/
        new/
          page.tsx
        [stepId]/
          page.tsx

  settings/
    page.tsx

  actions/
    leads.ts
    tasks.ts
    scripts.ts
    settings.ts

components/
  app-shell.tsx
  sidebar.tsx
  page-header.tsx
  task-card.tsx
  outcome-buttons.tsx
  lead-table.tsx
  lead-status-badge.tsx
  activity-timeline.tsx
  script-step-card.tsx
  script-outcome-list.tsx
  empty-state.tsx
  confirm-dialog.tsx

lib/
  prisma.ts
  workflow.ts
  metrics.ts
  script-renderer.ts
  dates.ts
  validations.ts
  constants.ts

prisma/
  schema.prisma
  seed.ts
```

---


# Metrics Helper

Create:

```text
lib/metrics.ts
```

This file should contain helper functions that query `JourneyEvent`, not mutable script names.

Examples:

```ts
getStepDropoffByMetricKey(metricKey: string)
getOutcomeCountsByMetricKey(metricKey: string)
getConversionByScriptVersion(scriptVersionId: string)
getLeadFailurePoint(leadId: string)
```

For v1, a full analytics dashboard is not required.

But these helpers should make it clear that future reporting is based on immutable journey events and stable keys.

---

# Script Renderer

Create:

```text
lib/script-renderer.ts
```

Function:

```ts
renderScriptText(template: string, lead: Lead, settings?: Record<string, string>): string
```

Replace:

```text
{{contactName}}
{{companyName}}
{{email}}
{{phone}}
{{userName}}
{{companySenderName}}
```

Fallbacks:

```text
contactName → there
companyName → your company
userName → Dejan
companySenderName → TruckA Company
```

---

# Visual Script Builder Later

Do not build the full visual builder in v1.

But prepare for it by storing:

```text
positionX
positionY
```

on `ScriptStep`.

Later, React Flow can use:

```text
nodes = script steps
edges = outcomes
```

Each outcome becomes an edge from:

```text
stepId → nextStepId
```

---

# Important Product Philosophy

Do not let the app become a passive database.

The app must actively tell Dejan what to do next.

The main user experience should be:

```text
Open Start Working
Do first task
Click outcome
System schedules next task
Move to next task
Repeat
```

The app should reduce thinking.

The app should increase consistent outreach execution.

---

# Final Codex Instruction

Build the complete app described above.

Prioritize:

```text
1. Correct workflow engine
2. Clear Start Working page
3. Reliable Prisma schema
4. Lead timeline
5. Outcome-based next task scheduling
6. Usable script builder
```

Do not spend time on:

```text
Fancy landing page
AI
Email sending integration
Phone integration
Visual flow builder
Analytics dashboard
```

The app is successful if Dejan can use it every morning to execute TruckA Company outreach without wondering what to do next.
