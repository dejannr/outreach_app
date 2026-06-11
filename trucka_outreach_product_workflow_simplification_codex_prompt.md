# TruckA Outreach Product Workflow Simplification Instructions for Codex

## 1. Goal

Refactor the existing TruckA Outreach app so the product workflow feels simpler, faster, more guided, and more automatic.

The app already supports:

```text
Creating scripts
Creating script steps
Creating outcomes
Assigning next steps
Creating leads
Starting outreach
Completing tasks
Selecting outcomes
Scheduling next steps
Viewing lead history
```

The problem is not missing functionality.

The problem is that too much of the workflow feels like an admin console.

The app currently exposes too many technical decisions to the user:

```text
Manual step keys
Manual outcome keys
Manual metric keys
Manual sort order
Manual routing decisions
Too many fields during setup
Too many advanced controls during normal use
Too many options shown at once
```

The goal of this refactor is to preserve the underlying architecture while making the user-facing product much easier to use.

The product should feel like:

```text
A guided outreach execution tool
```

Not:

```text
A workflow-engine admin panel
```

The app should automate everything it reasonably can.

The user should only make decisions that actually require human judgment.

---

# 2. Product Simplification Philosophy

## The architecture can be advanced, but the UI should not feel advanced

TruckA Outreach still needs:

```text
Script versioning
Metrics-safe stable keys
Outcome-based next-step scheduling
Custom outcomes
Historical safety
Lead history
Advanced controls for edge cases
```

But most of this should happen behind the scenes.

The user should not need to understand the internal architecture to use the product.

## Common workflow should be fast

The common daily flow should be:

```text
Open Start Working
See next task
Use script
Do outreach
Click outcome
Move on
```

This should take as few clicks as possible.

## Advanced control should exist, but not be default

Do not remove advanced controls.

Move them behind:

```text
Advanced
More options
Show technical details
Edit routing manually
Custom configuration
```

## The app should make decisions when the answer is obvious

Examples:

```text
Step keys can be generated automatically
Outcome keys can be generated automatically
Sort order can be assigned automatically
First step can be inferred when creating first script step
Next task titles can be generated automatically
Task due dates can be inferred from outcome delay
Lead status can be inferred from common outcomes
```

Do not ask the user to fill fields that the system can reliably infer.

## The app should guide setup

Script creation should feel like building an outreach playbook.

It should not feel like configuring a database model.

Use language like:

```text
Add first step
What should happen next?
When should this happen?
What outcome can happen?
```

Avoid language like:

```text
Define node key
Configure metric key
Set routing metadata
Set sort order index
```

Those technical fields should still exist, but hidden.

---

# 3. What Should Become Automatic

The following should be automatic wherever possible.

## Step keys

When creating a script step, auto-generate:

```text
key
metricKey
```

from the step name and channel.

Example:

```text
Step name: Day 8 Phone Call
Generated key: day_8_phone_call
Generated metricKey: phone_call
```

If a duplicate exists, append a suffix:

```text
day_8_phone_call_2
```

or:

```text
day_8_phone_call_v2
```

Do not force the user to manually enter these by default.

## Outcome keys

When creating an outcome, auto-generate:

```text
key
metricKey
```

from the outcome label.

Example:

```text
Outcome label: Voicemail Left
Generated key: voicemail_left
Generated metricKey: voicemail_left
```

If duplicate within the same step, append suffix:

```text
voicemail_left_2
```

Do not force the user to manually enter outcome keys by default.

## Sort order

Automatically assign sort order.

For steps:

```text
New step sortOrder = current max sortOrder + 1
```

For outcomes:

```text
New outcome sortOrder = current max sortOrder + 1
```

Do not ask the user for sort order in normal forms.

Move sort order to advanced settings only.

## Start step

When a script version has no start step and the user creates the first step:

```text
Set isStartStep = true automatically
```

If a start step already exists:

```text
Do not show start step checkbox by default
```

Move start step control to advanced.

## Task titles

Auto-generate task titles from step/channel/lead.

Examples:

```text
Send Day 1 Initial Email
Call John
Send Day 4 Follow-Up Email
Run Demo
Request Documents
Follow Up After Loom
```

Do not ask the user to manually title normal script-generated tasks.

## Task descriptions

Auto-generate task descriptions from step instructions.

Only ask for manual task description when the user creates a truly manual task.

## Lead status changes

For common outcomes, infer lead status automatically.

Examples:

```text
Positive Reply → ACTIVE
No Reply Yet → WAITING
Voicemail Left → WAITING
Demo Booked → DEMO_BOOKED
Documents Requested → DOCUMENTS_REQUESTED
Documents Received → DOCUMENTS_RECEIVED
Pilot Accepted → CLOSED_WON
Not Interested → NOT_INTERESTED
Bad Contact → DISQUALIFIED
```

Do not require status selection for common outcomes unless the user opens advanced controls.

## Due dates

Automatically calculate next task due date from outcome delay.

If outcome has:

```text
delayDays = 3
```

schedule the next task:

```text
now + 3 days
```

Only ask for date/time when the outcome explicitly requires scheduling, like:

```text
Busy - Call Back
Demo Booked
Manual Follow-Up
```

## Script version creation

When editing workflow structure on an active/published script, automatically guide the user to create a new draft version.

Do not expose confusing versioning decisions first.

Use plain language:

```text
This script is active. To safely change the workflow, create a new draft version.
```

Then provide:

```text
Create Draft Version
```

## Journey events and metrics snapshots

Continue creating journey events, metric snapshots, step snapshots, and outcome snapshots automatically.

Do not expose these details in normal task completion UI.

---

# 4. What Should Become Hidden / Advanced

The following should be hidden from normal users during normal workflows.

## Advanced-only script fields

Move these behind an Advanced section:

```text
step key
step metric key
sort order
is start step
is terminal step
is archived
position X
position Y
raw metadata
script version internals
```

## Advanced-only outcome fields

Move these behind Advanced:

```text
outcome key
outcome metric key
sort order
requires note
requires contact
requires date/time
is archived
raw metadata
manual status override
terminal technical behavior
```

## Advanced-only lead fields

Move these behind Advanced:

```text
script version id
current step id
next task raw timestamp
custom fields JSON
tags JSON if complex
owner id
startedAt
completedAt
createdAt
updatedAt
```

## Advanced-only task fields

Move these behind Advanced:

```text
task id
step id
snapshot fields
completed outcome id
priority override
raw activity metadata
```

## Advanced-only workflow controls

Move these behind Advanced / More:

```text
Manual step assignment
Script version migration
Archive step
Archive outcome
Edit metric key
Edit stable key
Edit raw routing metadata
Delete records
```

---

# 5. What Should Stay Manual

Some things should remain manual because they require human judgment.

Keep these manual:

```text
Writing or editing script text
Choosing the next step when creating a custom branch
Selecting the outcome after outreach
Adding notes after a call or reply
Choosing callback time when prospect says call later
Choosing demo time
Marking documents received
Marking pilot accepted or rejected
Creating a custom outcome when an unexpected response happens
Deciding whether to create a new reusable branch
```

The app should automate structure and defaults.

The human should decide what actually happened with the prospect.

---

# 6. Script Creation Simplification

## Current problem

Creating scripts feels too technical.

The user should not feel like they are building database objects.

## New script creation flow

Use a guided flow:

```text
1. Name the script
2. Choose starting template or blank script
3. Add first step
4. Add outcomes for that step
5. Continue adding next steps as needed
```

## Script creation form

Visible fields:

```text
Script name
Description optional
Template option
```

Hidden/defaulted:

```text
Version number
Active status
Technical IDs
Created by
Metric architecture
```

## Template options

Add simple template choices:

```text
Blank Script
TruckA Carrier Invoice Outreach
Simple Email + Call Sequence
```

If template selected, generate default steps/outcomes automatically.

## After script creation

After creating a script, take the user directly to:

```text
Add first step
```

or if using a template:

```text
Review script steps
```

Do not drop the user into an empty technical script detail page.

---

# 7. Step Creation Simplification

## Current problem

Creating a step likely exposes too many fields.

## New step creation form

Visible fields only:

```text
Step name
Channel
Subject line if channel is EMAIL
Script text
Instructions optional
```

Everything else should be auto-generated or hidden.

## Auto-generated fields

On save, generate:

```text
key
metricKey
sortOrder
isStartStep if first step
defaultDelayDays if inferred
```

## Channel-based defaults

When user selects channel, prefill sensible defaults.

### EMAIL

Show:

```text
Subject
Email body
Instructions
```

Default common outcomes:

```text
Sent / Waiting
Positive Reply
Not Interested
Bad Contact
Custom Outcome
```

### PHONE

Show:

```text
Call script
Instructions
```

Default common outcomes:

```text
No Answer
Voicemail Left
Busy - Call Back
Interested
Not Interested
Custom Outcome
```

### DEMO

Show:

```text
Demo script
Instructions
```

Default common outcomes:

```text
Documents Requested
Needs Time
Not A Fit
Not Interested
Custom Outcome
```

### DOCUMENT_REQUEST

Default outcomes:

```text
Documents Received
Still Waiting
Not Interested
Custom Outcome
```

### CLOSE

Default outcomes:

```text
Accepted
Needs Time
Price Objection
Not Interested
Custom Outcome
```

## Step creation UX

After saving a step, show:

```text
Step created.
Now add outcomes for what can happen next.
```

Or offer:

```text
Use common outcomes for this channel
```

## Advanced step fields

Put these under Advanced:

```text
Step key
Metric key
Sort order
Start step
Terminal step
Archived
Position X/Y
```

---

# 8. Outcome Creation Simplification

## Current problem

Creating outcomes requires too many decisions.

The user should not need to think about every technical field.

## New outcome creation form

Visible fields:

```text
Outcome label
What happens next?
When should it happen?
```

That is the main model.

## Outcome form simplified

### Field 1: Outcome label

Example:

```text
Voicemail Left
Positive Reply
No Answer
Demo Booked
Documents Received
```

Auto-generate:

```text
key
metricKey
```

### Field 2: What happens next?

Use clear options:

```text
Go to another step
Create a manual task
Stop sequence
Mark lead as won
Mark lead as lost
Mark lead as not interested
Mark lead as disqualified
```

If "Go to another step":

```text
Show next step dropdown
```

If no step exists yet:

```text
Create new step
```

### Field 3: When should it happen?

Use simple choices:

```text
Immediately
Tomorrow
In 2 days
In 3 days
In 5 days
In 7 days
Choose date/time when completing task
Custom delay
```

Internally map to:

```text
delayDays
requiresDateTime
```

## Auto-inferred terminal status

If user selects:

```text
Stop sequence
Mark lead as won
Mark lead as lost
Mark not interested
Mark disqualified
```

then set:

```text
isTerminal = true
nextStepId = null
setLeadStatus = corresponding status
```

Do not make the user configure those manually.

## Common outcome presets

For each step channel, provide:

```text
Add common outcomes
```

Example for phone:

```text
No Answer → next email tomorrow
Voicemail Left → next email tomorrow
Busy - Call Back → requires date/time
Interested → qualification or demo
Not Interested → stop sequence
Custom Outcome → manual
```

## Outcome advanced fields

Hide:

```text
key
metricKey
sortOrder
requiresNote
requiresContact
requiresDateTime
metadata
archived
```

Expose only when clicking:

```text
Advanced outcome settings
```

---

# 9. Lead Creation Simplification

## Current problem

Lead creation should not feel like CRM data entry.

## New lead creation form

Required:

```text
Company name
```

Recommended visible fields:

```text
Contact name
Email
Phone
Role
Notes
```

Optional collapsed:

```text
Website
Source
Tags
Custom fields
```

Do not ask for script assignment by default.

Default behavior:

```text
Lead stays NEW until outreach is started.
When outreach starts, assign active script version automatically.
```

## Quick lead creation

Add a quick-add form from Start Working or Leads page:

```text
Company
Contact
Email
Phone
[Create Lead]
```

After creating lead, offer:

```text
Start Outreach Now
Create Another
View Lead
```

## Lead import simplification

CSV import should infer fields from common headers.

Support header aliases:

```text
company, companyName, company_name, business
contact, contactName, name, person
email, emailAddress
phone, phoneNumber, mobile
role, title
website, url
source
```

Show simple preview.

Only show serious errors.

---

# 10. Task Completion Simplification

## Current problem

Completing tasks should be faster.

The app should not make the user feel like they are filling a report after every action.

## New task completion flow

Task card should show:

```text
Common outcome buttons
More outcomes dropdown
Optional note
```

Clicking a common outcome should complete the task immediately if no extra input is required.

## One-click outcomes

These should complete immediately:

```text
Sent / Waiting
No Answer
Voicemail Left
Positive Reply
Not Interested
Bad Contact
Documents Received
Loom Sent
```

After click, show inline/toast confirmation:

```text
Done. Next step scheduled: Day 9 Email tomorrow.
```

## Outcomes requiring extra input

Only open a dialog when needed.

Examples:

### Busy - Call Back

Ask:

```text
Callback date/time
Optional note
```

### Demo Booked

Ask:

```text
Demo date/time
Optional attendees/note
```

### Wrong Person

Ask:

```text
Correct contact name
Email
Phone
Role
Optional note
```

### Custom Outcome

Ask:

```text
What happened?
What should happen next?
```

## More outcomes

If a step has many outcomes, show common 4-5 outcomes first.

Place the rest under:

```text
More outcomes
```

Always include:

```text
Other / Custom
```

inside More outcomes.

## Notes

Notes should be optional by default.

Only require notes for:

```text
Custom outcome
Manual override
Disqualification if useful
```

---

# 11. Start Working Simplification

## Current problem

Start Working must be fast and guided.

## New behavior

When user opens Start Working, the app should show:

```text
The most important work first
```

Priority:

```text
1. Overdue high-value tasks
2. Overdue normal tasks
3. Due today high-value tasks
4. Due today normal tasks
5. New leads to start
```

## Reduce decisions

The user should not need to decide which section matters.

The app should provide:

```text
Next recommended task
```

at the top.

Example:

```text
Next up: Call John at ABC Transport
```

Then below:

```text
All due tasks
```

## New leads

New leads should be available, but not distracting from follow-ups.

Show:

```text
Start 10 new leads today
```

Use daily new lead limit.

Do not ask the user to choose scripts for each new lead.

Use active script automatically.

## Task execution

From Start Working, the user should be able to:

```text
Copy script
Call/email
Select outcome
Move to next task
```

without navigating away.

---

# 12. Lead Detail Simplification

## Current problem

Lead detail pages can become too record-heavy.

## New behavior

Lead detail page should be action-first.

Top of page:

```text
Lead summary
Current open task
Next scheduled action
```

Then:

```text
Recent history
Notes
Details
Advanced
```

## Current task

If open task exists, show it prominently.

If no open task exists, show:

```text
No open task
```

and offer:

```text
Create Manual Task
Resume Outreach
Change Status
```

## Advanced details

Move these to Advanced:

```text
Script version
Current step ID
Step key
Metric key
Journey event metadata
Raw custom fields
Full technical timeline
```

## Manual override

Keep manual override available but not prominent.

Place under:

```text
More actions
```

or:

```text
Advanced
```

---

# 13. Script Management Simplification

## Current problem

Script management likely feels too technical.

## New script management model

There should be two modes:

```text
Simple Mode
Advanced Mode
```

Default:

```text
Simple Mode
```

## Simple Mode

Show script as:

```text
Steps in order
Outcomes under each step
Next step routing in plain English
```

Example:

```text
Day 8 Phone Call

If No Answer → Send Day 9 Email tomorrow
If Voicemail Left → Send Day 9 Email tomorrow
If Interested → Ask qualification questions immediately
If Not Interested → Stop sequence
```

This is much easier than showing technical config.

## Advanced Mode

Show technical controls:

```text
Keys
Metric keys
Sort order
Archived items
Raw routing details
Version migration
Metadata
```

## Editing active scripts

When editing a published/active script, use guided prompts.

If the user edits script text only:

```text
Allow safe text edit
```

If the user changes routing or structure:

```text
Prompt to create new draft version
```

Plain language:

```text
This changes the workflow. To preserve metrics and existing leads, create a new script version.
```

Buttons:

```text
Create Draft Version
Cancel
```

---

# 14. Settings Simplification

## Current problem

Settings can become a dumping ground.

## New settings layout

Use sections:

```text
General
Outreach Defaults
Advanced
```

## General visible fields

```text
User name
Company name
Timezone
```

## Outreach Defaults visible fields

```text
Active script
Daily new lead limit
Default working days
```

## Advanced collapsed

```text
Technical settings
Raw app settings
Debug options
Workflow safety options
```

Do not show raw JSON settings by default.

---

# 15. Smart Defaults and Auto-Generation Rules

Implement these helpers.

## Key generation helper

Create helper:

```ts
generateKey(input: string): string
```

Rules:

```text
Lowercase
Trim whitespace
Replace spaces with underscores
Remove special characters
Collapse duplicate underscores
Remove leading/trailing underscores
```

Example:

```text
"Day 8 Phone Call" → "day_8_phone_call"
"Voicemail Left!" → "voicemail_left"
```

## Unique key helper

Create helper:

```ts
generateUniqueKey(baseKey: string, existingKeys: string[]): string
```

Rules:

```text
If base key is unused, use it.
If used, append _2, _3, etc.
```

## Metric key generation

Default metric key can be generated from channel or label.

For steps:

```text
EMAIL → email_step
PHONE → phone_call
DEMO → demo
DOCUMENT_REQUEST → document_request
LOOM → loom
CLOSE → close
BREAKUP → breakup
MANUAL → manual_step
```

If step name is more specific, generate from name.

For outcomes:

```text
Use outcome label key by default.
```

## Sort order helper

For new steps:

```ts
nextSortOrder = max(existingStep.sortOrder) + 1
```

For new outcomes:

```ts
nextSortOrder = max(existingOutcome.sortOrder) + 1
```

## Default outcome presets

Create presets by channel.

### EMAIL presets

```text
Sent / Waiting
Positive Reply
Not Interested
Bad Contact
Custom Outcome
```

### PHONE presets

```text
No Answer
Voicemail Left
Busy - Call Back
Interested
Wrong Person
Not Interested
Custom Outcome
```

### DEMO presets

```text
Documents Requested
Needs Time
Not A Fit
Not Interested
Custom Outcome
```

### DOCUMENT_REQUEST presets

```text
Documents Received
Still Waiting
Not Interested
Custom Outcome
```

### LOOM presets

```text
Loom Sent
Acknowledged Value
Needs Team Review
No Reply
Not Interested
Custom Outcome
```

### CLOSE presets

```text
Accepted
Needs Time
Price Objection
Not Interested
Custom Outcome
```

## Default lead status mapping

Use mapping:

```text
not_interested → NOT_INTERESTED
bad_contact → DISQUALIFIED
demo_booked → DEMO_BOOKED
documents_requested → DOCUMENTS_REQUESTED
documents_received → DOCUMENTS_RECEIVED
loom_sent → LOOM_SENT
pilot_accepted → CLOSED_WON
closed_lost → CLOSED_LOST
waiting/no_reply → WAITING
positive/interested → ACTIVE
```

## Default task priority

Set automatically:

```text
DEMO → HIGH
DOCUMENT_REQUEST → HIGH
LOOM → HIGH
CLOSE → HIGH
PHONE → NORMAL
EMAIL → NORMAL
MANUAL → NORMAL
BREAKUP → LOW
```

---

# 16. Progressive Disclosure Rules

Use progressive disclosure everywhere.

## Level 1: Daily use

Show only what is needed to execute.

Examples:

```text
Task
Script
Contact info
Outcome buttons
```

## Level 2: Management

Show what is needed to configure.

Examples:

```text
Step names
Outcome labels
Next step routing
Delay
```

## Level 3: Advanced

Show technical architecture.

Examples:

```text
Keys
Metric keys
Version internals
Journey event metadata
Raw JSON
Archived objects
Manual migrations
```

Default to Level 1 or Level 2 depending on page.

Never default to Level 3.

---

# 17. Anti-Patterns To Remove

Remove these product-flow anti-patterns.

## Asking for fields the app can generate

Do not ask for:

```text
key
metricKey
sortOrder
task title
task due date
lead status
```

unless advanced mode is open.

## Making every workflow choice manual

Use defaults and presets.

The user should not configure every detail from scratch.

## Exposing architecture during execution

Do not show script engine details in Start Working.

## Treating script creation like database configuration

Script creation should feel like building a playbook.

## Making common outcomes slow

Common outcomes should be one-click.

## Forcing notes too often

Notes should be optional unless required by the selected outcome.

## Making users pick scripts for every lead

Use active script automatically.

## Making users manually schedule obvious follow-ups

Use outcome delay automatically.

## Showing advanced controls by default

Advanced controls should exist but not dominate.

---

# 18. Acceptance Criteria

The refactor is successful when the following are true.

## Script creation

```text
User can create a script without entering keys, metric keys, or sort order.
First step becomes start step automatically.
Script setup feels guided.
Template option exists or is supported.
```

## Step creation

```text
User can create a step using only name, channel, script text, and optional instructions.
Step key is auto-generated.
Metric key is auto-generated.
Sort order is auto-assigned.
Advanced fields are hidden.
Channel-based common outcomes can be added automatically.
```

## Outcome creation

```text
User can create an outcome using label, what happens next, and when it happens.
Outcome key is auto-generated.
Metric key is auto-generated.
Sort order is auto-assigned.
Terminal behavior is inferred from selected action.
Status changes are inferred where possible.
Advanced fields are hidden.
```

## Lead creation

```text
User can create a lead with minimal fields.
Script assignment is not required during lead creation.
Starting outreach assigns active script automatically.
Quick-add lead flow exists.
```

## Task completion

```text
Common outcomes are one-click.
Extra dialogs only appear when required.
More outcomes are hidden under More outcomes.
Notes are optional by default.
After completion, next step confirmation is clear.
```

## Start Working

```text
The page recommends the next best task.
Due tasks are prioritized automatically.
New leads use active script automatically.
User can execute tasks without leaving the page.
```

## Lead detail

```text
Current task is prominent.
Advanced workflow details are hidden.
Manual override exists but is not primary.
Lead history remains available.
```

## Script management

```text
Simple Mode is default.
Advanced Mode exists for keys, metric keys, versioning, archived items, and technical routing.
Editing active workflow structure prompts new draft version.
Safe text edits are allowed without unnecessary complexity.
```

## Architecture

```text
Script versioning remains intact.
Stable keys remain intact.
Metric keys remain intact.
Journey events remain intact.
Historical safety remains intact.
Custom outcomes remain supported.
Manual overrides remain supported.
```

## Overall product feel

```text
The app feels streamlined.
The app feels guided.
The app feels operational.
The app feels low-friction.
The app feels automatic where possible.
The app no longer feels like a workflow-engine admin console.
```

---

# 19. Final Instruction To Codex

Refactor the existing TruckA Outreach app product workflow according to this document.

Do not rebuild the app from scratch.

Do not remove the core workflow architecture.

Preserve:

```text
Script versioning
Stable step/outcome keys
Metric-safe reporting architecture
Journey events
Outcome-based next-step scheduling
Custom outcomes
Historical lead timelines
Manual overrides
Advanced controls
```

But move complexity behind the scenes.

Make the app automatically handle:

```text
Step keys
Outcome keys
Metric keys
Sort order
Default task titles
Default due dates
Default lead status changes
Common outcome presets
Active script assignment
Next task scheduling
Journey event snapshots
```

Make the user-facing product feel like:

```text
Create script in plain language
Add steps easily
Use sensible outcomes
Add leads quickly
Start outreach immediately
Complete tasks with one click when possible
Let the system schedule the next step
```

The final product should be a streamlined, guided, operational outreach workflow tool.

It should be powerful underneath, but simple on the surface.
