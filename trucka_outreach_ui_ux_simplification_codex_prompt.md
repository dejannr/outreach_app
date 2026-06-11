# TruckA Outreach UI/UX Simplification Instructions for Codex

## 1. Goal

Simplify the existing TruckA Outreach app UI/UX so it feels faster, lighter, clearer, and more focused for daily operational execution.

TruckA Outreach is not a marketing site.

TruckA Outreach is not primarily a CRM for browsing data.

TruckA Outreach is a daily outreach execution tool.

The app should help the user answer four questions as quickly as possible:

```text
What do I do now?
What do I say?
What happened?
What happens next?
```

The current app works, but it feels too heavy and contains too much visible information, too many controls, too many fields, and too much interaction complexity.

Refactor the UI/UX to reduce cognitive load and prioritize the main daily workflow:

```text
Open Start Working
↓
See due tasks
↓
Read the script
↓
Perform the outreach action
↓
Select the outcome
↓
System schedules the next step
```

Do not redesign the app from scratch.

Do not remove core workflow functionality.

Simplify the existing app by removing, hiding, merging, compressing, and de-emphasizing anything that does not directly support daily execution.

---

# 2. Product Philosophy for Simplification

## The app should feel like a workbench

TruckA Outreach should feel like a focused operations workbench.

It should not feel like:

```text
A heavy CRM
A data warehouse
A reporting platform
A marketing dashboard
A design-heavy SaaS product
A tool where every possible field is visible at once
```

It should feel like:

```text
A daily command center
A task execution queue
A simple lead follow-up system
A script-guided outreach assistant
```

## The product is built around tasks, not records

The primary unit of the UI should be:

```text
Task
```

Not:

```text
Lead profile
Database row
Script object
Settings panel
```

The lead, script, and history matter only because they help the user complete the next task.

## Every screen should have one obvious purpose

If a page has too many competing purposes, simplify it.

For example:

```text
Start Working = execute today’s tasks
Leads = find or review leads
Lead Detail = understand this lead and act
Scripts = manage workflow logic
Settings = configure app defaults
```

Do not let each page become a mini-dashboard with too many sections.

## Hide secondary information until needed

Use progressive disclosure.

Show the essential information first.

Move advanced details into:

```text
Collapse sections
Details panels
Secondary tabs
Dialogs
"Show more" areas
```

Do not display everything just because the database has it.

## Optimize for repeated daily use

The user will use this app every day.

The UI should become predictable and fast.

Avoid designs that look impressive once but slow the user down every day.

---

# 3. What To Remove

Remove or hide anything that does not directly help the user complete outreach work.

## Remove unnecessary dashboard clutter

Remove dashboard elements that do not help immediate execution, such as:

```text
Large decorative headers
Large hero sections
Generic welcome messages
Overly detailed analytics summaries
Non-actionable charts
Decorative cards
Excessive explanatory text
Repeated descriptions of what the app does
```

Keep only operational summaries that help decide what to do next.

## Remove redundant metadata

Do not show all metadata everywhere.

Remove repeated display of:

```text
Internal IDs
Created timestamps
Updated timestamps
Script version IDs
Database keys
Metric keys
Full custom field JSON
Technical status metadata
Long descriptions repeated across cards
```

These can remain available in admin/script pages or advanced details, but they should not appear in normal daily execution views unless useful.

## Remove unnecessary buttons

Avoid showing many actions at once.

Remove or hide secondary actions like:

```text
Duplicate edit buttons
Multiple ways to do the same action
Archive buttons on primary task cards
Delete buttons in high-frequency views
Advanced override buttons on task cards
Script edit buttons inside Start Working
Settings shortcuts inside operational cards
```

Keep primary actions visible.

Move secondary actions into a small menu:

```text
More
```

or a collapsed advanced section.

## Remove excessive visual grouping

If a page has too many cards inside cards, flatten it.

Avoid:

```text
Card inside card inside panel
Too many bordered sections
Too many badges in one row
Too many small labels around every data point
```

Use fewer containers.

Use spacing and typography instead of excessive boxes.

---

# 4. What To Reduce

## Reduce visible fields

On daily-use screens, show only fields that help action.

For a lead task, show:

```text
Company
Contact
Phone
Email
Current step
Due date
Script
Outcome buttons
Notes
```

Do not show by default:

```text
Source
Website
Tags
Custom fields
Created date
Updated date
Owner
Script version
Metric keys
Full lead metadata
All previous notes
All previous activities
```

Those can appear on lead detail or in expandable sections.

## Reduce visible outcomes

Do not show every possible outcome as a large button if there are many.

For task cards:

Show the most common outcomes as primary visible buttons.

Move less common outcomes into:

```text
More outcomes
```

Example for phone tasks:

Visible:

```text
No Answer
Voicemail
Interested
Busy
Not Interested
```

Hidden under More:

```text
Wrong Person
Gatekeeper
Asked Price
Asked If AI
Privacy Concern
Already Has Software
Custom Outcome
```

For email tasks:

Visible:

```text
Sent / Waiting
Positive Reply
Not Interested
Bad Contact
```

Hidden under More:

```text
Custom Outcome
Manual Override
```

## Reduce timeline noise

The timeline should not dominate the lead detail page.

Show the most recent 5-10 activities by default.

Add:

```text
Show full history
```

Group technical events where possible.

For example, instead of showing:

```text
Task completed
Outcome selected
Next task created
Lead status changed
```

as four visually equal items, show one grouped event:

```text
Completed Day 8 Phone Call → Voicemail Left
Next: Day 9 Email scheduled for tomorrow
```

## Reduce form length

Forms should ask only for required or commonly used fields first.

Advanced fields should be hidden.

Use sections:

```text
Basic
Optional
Advanced
```

Default open:

```text
Basic
```

Default collapsed:

```text
Optional
Advanced
```

---

# 5. What To Keep Prominent

Keep these elements highly visible.

## On Start Working

Prominent:

```text
Next task to do
Lead name/company
Contact method
Script text
Primary action buttons
Outcome buttons
```

Not prominent:

```text
Lead metadata
Script configuration
Long history
Advanced controls
```

## On Task Cards

Prominent:

```text
What step this is
Who to contact
What to say
How to contact them
What happened
```

The task card should answer:

```text
Who?
Why now?
Say what?
Click what happened?
```

## On Lead Detail

Prominent:

```text
Current task
Current status
Contact info
Latest timeline
Next scheduled action
```

Secondary:

```text
Full history
All notes
Source
Tags
Technical workflow info
```

## On Script Pages

Prominent:

```text
Steps
Outcomes
Next step routing
Active version
```

Secondary:

```text
Metric keys
Archived steps
Technical metadata
Position fields
Advanced version history
```

Do not remove metric keys entirely because they are important for workflow safety, but de-emphasize them visually.

---

# 6. Page-by-Page Simplification Rules

## /start-working

This is the most important page.

Simplify aggressively.

### Purpose

The page should help the user execute tasks.

It should not become a general dashboard.

### Keep

```text
Today summary
Overdue tasks
Due today tasks
High-value follow-ups
New leads to start
```

### Remove or hide

```text
Large welcome section
Long explanatory copy
Detailed analytics
Full lead metadata
Full script metadata
Too many filters
Too many sort controls
Large page decorations
```

### Recommended layout

```text
Page header
Small summary row
Primary task queue
New leads section
```

### Summary row

Use compact cards only:

```text
Overdue
Due Today
High Value
New Leads
```

Do not show more than 4-5 summary cards.

### Task queue

Show task cards in a single clear column or simple grouped sections.

Priority order:

```text
1. Overdue
2. Due Today
3. High-Value Follow-Ups
4. New Leads
```

Do not make the user hunt for the next task.

### Task card density

Each task card should be compact but readable.

Avoid expanding every task into a full lead profile.

### Start Working action

For new leads, keep only:

```text
Start Outreach
View Lead
```

Do not show script selection, advanced fields, or edit controls directly in the new lead card.

---

## /leads

### Purpose

Find and review leads.

Not execute the full workflow.

### Keep

```text
Search
Status filter
Lead table
Create lead
Import leads
```

### Remove or hide

```text
Too many columns
Large cards for every lead
Long descriptions
Detailed script state in table
Technical workflow fields
```

### Recommended table columns

Use only:

```text
Company
Contact
Status
Current / Next Step
Next Task
Last Contacted
Actions
```

Hide by default:

```text
Created at
Updated at
Owner
Source
Website
Tags
Script version
Metric keys
```

If needed, put additional fields inside lead detail.

### Search and filters

Keep filters simple:

```text
Search
Status
Due / Overdue
```

Do not add many advanced filters in v1.

---

## /leads/new

### Purpose

Create a lead quickly.

### Required visible fields

```text
Company name
Contact name
Email
Phone
Role
Notes
```

### Optional collapsed fields

```text
Website
Source
Tags
Custom fields
```

### Remove

Do not show script assignment unless necessary.

Default behavior:

```text
New lead uses active script when outreach starts.
```

Do not make lead creation feel like CRM data entry.

---

## /leads/import

### Purpose

Import leads quickly.

### Keep

```text
CSV paste/upload
Expected headers
Preview
Import valid rows
Error display
```

### Reduce

Show only essential validation errors.

Do not show a complex import wizard.

Recommended steps:

```text
Paste CSV
Preview
Import
```

---

## /leads/[id]

### Purpose

Understand this lead and act.

### Recommended layout

```text
Header
Current task
Timeline preview
Lead details
Advanced workflow details collapsed
```

### Header should show

```text
Company
Contact
Status
Phone
Email
Next task
```

### Current task should be prominent

If the lead has an open task, show it directly near the top.

Do not make the user scroll to act.

### Timeline

Show latest activity first.

Show 5-10 items by default.

Add:

```text
Show full timeline
```

### Lead details

Keep compact.

Use a two-column metadata grid only if helpful.

### Quick actions

Show only most common quick actions:

```text
Add Note
Create Task
Change Status
```

Move these into More / Advanced:

```text
Assign Step
Manual Override
Migrate Script Version
Mark Closed Lost
Archive
Delete
```

Do not make destructive actions prominent.

---

## /scripts

### Purpose

Manage scripts.

This is less frequent than daily task execution.

### Keep

```text
Script list
Active script indicator
Create script
Set active
View/edit script
```

### Reduce

Do not show full script details on the list page.

Recommended columns:

```text
Script name
Active version
Steps
Status
Updated
Actions
```

Hide advanced version/metric details until inside script detail.

---

## /scripts/[id]

### Purpose

Edit workflow logic.

This page can be more detailed than Start Working, but still should be structured.

### Simplify with tabs

Use tabs:

```text
Overview
Steps
Versions
Advanced
```

Default tab:

```text
Steps
```

### Steps list

Each step card should show:

```text
Step name
Channel
Start/terminal indicator
Number of outcomes
Edit
```

Collapse outcomes by default if there are many.

### Outcome rows

Show:

```text
Label
Next step
Delay
Status change
```

De-emphasize:

```text
Metric key
Internal key
Archived state
Metadata JSON
```

Metric keys should be visible in Advanced mode or inside edit dialogs.

### Avoid

Do not put a full visual workflow builder in v1 simplification.

If a visual builder exists and is heavy, hide it behind:

```text
Visual view
```

and keep the list/form builder as default.

---

## /settings

### Purpose

Configure app basics.

### Keep

```text
Active script
Daily new lead limit
User name
Company name
Timezone
```

### Hide or remove from primary settings

```text
Technical constants
Raw JSON settings
Debug data
Advanced workflow metadata
Experimental options
```

Use sections:

```text
General
Outreach
Advanced
```

Keep Advanced collapsed.

---

# 7. Component Simplification Rules

## Cards

Cards should have one job.

Do not put too many unrelated actions in one card.

If a card has more than 3 visual sections, consider splitting or simplifying.

Card header should be short.

Avoid long subtitles.

## Buttons

Use one primary button per area.

Example:

```text
Primary: Complete Task
Secondary: Copy Script
Secondary: View Lead
```

Avoid multiple same-level buttons competing for attention.

Move rare actions to:

```text
More
```

## Badges

Use badges only for important state.

Do not badge every property.

Good badges:

```text
Overdue
Phone
Email
Demo Booked
Waiting
Closed Won
```

Unnecessary badges:

```text
Has email
Has phone
Created manually
Script v1
Metric enabled
```

## Dialogs

Use dialogs for focused actions:

```text
Complete with outcome requiring note
Schedule callback
Create manual task
Change status
```

Do not use dialogs for large multi-section editing unless necessary.

## Tabs

Use tabs to separate major modes.

Do not create too many tabs.

Recommended maximum:

```text
3-4 tabs per page
```

---

# 8. Form Simplification Rules

## Use progressive disclosure

Every form should have:

```text
Required fields visible
Optional fields collapsed
Advanced fields collapsed
```

## Lead form

Visible:

```text
Company name
Contact name
Email
Phone
Role
Notes
```

Collapsed optional:

```text
Website
Source
Tags
Custom fields
```

## Script step form

Visible:

```text
Name
Channel
Subject
Script text
Instructions
```

Collapsed advanced:

```text
Step key
Metric key
Sort order
Start step
Terminal step
Archived
Position X/Y
```

## Outcome form

Visible:

```text
Label
Next step
Delay days
Lead status change
Terminal
```

Collapsed advanced:

```text
Outcome key
Metric key
Requires note
Requires date/time
Requires contact
Metadata
Sort order
Archived
```

## Settings form

Visible:

```text
Active script
Daily new lead limit
User name
Company name
Timezone
```

Collapsed advanced:

```text
Working days
Debug settings
Raw values
```

## Validation

Keep validation messages short.

Use:

```text
Company name is required.
Email must be valid.
Delay cannot be negative.
```

Avoid verbose error explanations.

---

# 9. Table Simplification Rules

Tables should be scannable.

## Lead table

Default columns:

```text
Company
Contact
Status
Next Step
Next Task
Last Contacted
Actions
```

Remove from default:

```text
ID
Created
Updated
Owner
Source
Website
Tags
Script version
Custom fields
```

## Scripts table

Default columns:

```text
Name
Active Version
Steps
Updated
Actions
```

Remove from default:

```text
Created by
Internal ID
All versions
Full description
Technical keys
```

## Table actions

Use one main action:

```text
View
```

Move secondary actions into row menu:

```text
Edit
Archive
Set active
Duplicate
```

## Table density

Use compact rows.

Avoid large card-like table rows.

Use hover states for scanability.

---

# 10. Task Card Simplification Rules

Task cards are the core UX.

Simplify them heavily.

## Task card must answer

```text
Who is this?
What is due?
What do I say?
What outcome happened?
```

## Required visible sections

```text
Lead header
Contact actions
Current step
Script text
Outcome buttons
Notes
```

## Lead header

Show:

```text
Company
Contact name
Status badge
Due indicator
```

Do not show:

```text
Source
Tags
Website
Created date
Script version
Metric keys
Full lead metadata
```

## Contact actions

For email task:

```text
Email address
Copy subject
Copy body
Mailto
```

For phone task:

```text
Phone number
Call link
```

Do not show irrelevant contact actions.

For example, do not show phone-first controls on an email task unless necessary.

## Script text

Show rendered script text clearly.

Use a clean script panel.

Add:

```text
Copy Script
```

For email tasks also:

```text
Copy Subject
```

Do not show template variables or raw script unless in script edit mode.

## Outcome buttons

Show common outcomes first.

Use max 4-5 visible buttons.

Put the rest under:

```text
More outcomes
```

Always include:

```text
Other / Custom
```

but it can be inside More outcomes.

## Notes

Notes should be optional.

Use a small textarea:

```text
Add note about what happened...
```

Do not require notes unless the selected outcome requires it.

## After outcome selected

Show simple confirmation:

```text
Done. Next step scheduled for tomorrow: Day 9 Email.
```

Do not show a large success modal unless needed.

---

# 11. Lead Detail Simplification Rules

The lead detail page should not feel like a full CRM profile unless the user expands it.

## Top section

Show:

```text
Company
Contact
Status
Next task
Phone
Email
```

## Current task

If an open task exists, show it immediately.

This is the most important part.

## Timeline

Show a compact timeline.

Default:

```text
Last 5-10 events
```

Each event should be human-readable.

Example:

```text
Completed Day 8 Phone Call → Voicemail Left
Next: Day 9 Email scheduled for tomorrow
```

Avoid showing four separate technical events for one workflow action.

## Details

Use collapsed sections:

```text
Lead details
Notes
Full history
Advanced workflow info
```

Advanced workflow info includes:

```text
Script version
Step key
Metric key
Custom fields
Raw metadata
```

Keep it hidden by default.

---

# 12. Script Management Simplification Rules

Script management can be detailed, but should not overwhelm.

## Default script page view

Show steps in order.

Each step:

```text
Name
Channel
Number of outcomes
Start/terminal label if relevant
Edit button
```

Do not show full script text for every step in the main list.

Show a preview only.

## Step detail/edit

Inside step edit, show:

```text
Script text
Instructions
Outcomes
```

Advanced step configuration should be collapsed.

## Outcomes

In the default view, show:

```text
Outcome label
Next step
Delay
Terminal status
```

Hide:

```text
Metric key
Internal key
Metadata JSON
Archived flag
```

unless Advanced is expanded.

## Versioning

Make versioning clear but not noisy.

Show:

```text
Active version: v1
Create new version
Set active
```

Do not show long version history by default.

Put it under:

```text
Versions
```

## Custom outcomes

Keep support for:

```text
Other / Custom Outcome
```

But do not make custom outcome architecture visible everywhere.

Only show it during task completion and in advanced script management.

---

# 13. Navigation Simplification Rules

Navigation should be minimal.

Main nav:

```text
Start Working
Leads
Scripts
Settings
```

Do not add extra top-level nav items unless essential.

Avoid:

```text
Dashboard
Analytics
Activities
Tasks
Notes
Imports
Admin
Versions
```

unless they are truly needed.

Those can exist as sub-pages or sections inside existing pages.

## Start Working should be first

The main page is:

```text
Start Working
```

It should be the default route.

The app should not open on a generic dashboard.

## Sidebar labels

Use plain labels.

Avoid clever naming.

Good:

```text
Start Working
Leads
Scripts
Settings
```

Bad:

```text
Command Center
Pipeline Studio
Growth Desk
Strategy Hub
```

---

# 14. Empty State and Microcopy Simplification

Microcopy should be short and operational.

## Empty states

Use practical messages.

Good:

```text
No tasks due today.
```

```text
No leads yet. Add a lead to start outreach.
```

```text
No overdue tasks.
```

Avoid:

```text
You're all caught up and ready to conquer the day!
```

```text
Your outreach journey starts here.
```

This is an internal tool.

Keep the tone clear and direct.

## Button labels

Use direct verbs.

Good:

```text
Start Outreach
Complete Task
Create Lead
Import Leads
Add Note
Schedule Follow-Up
```

Avoid:

```text
Let's Go
Make Magic
Begin Journey
Launch Sequence
```

## Confirmation messages

Use simple confirmations.

Good:

```text
Task completed. Next step scheduled for tomorrow.
```

```text
Lead marked as not interested.
```

```text
Demo task scheduled.
```

Avoid long explanations.

---

# 15. Anti-Patterns To Remove

Remove these UX anti-patterns.

## Too much visible data

Do not show every field everywhere.

## Too many buttons

Do not show all possible actions at the same visual priority.

## Too many badges

Badges lose meaning if everything is badged.

## Overly complex task cards

Task cards should not become full lead profiles.

## Dashboard-first thinking

This app is not primarily about dashboards.

It is about execution.

## CRM-first thinking

This app is not primarily about browsing lead records.

Lead records support task execution.

## Script-management leakage

Do not expose script-building complexity in daily task execution views.

## Advanced settings visible by default

Advanced settings should be collapsed.

## Technical metadata visible by default

Keys, IDs, and metric fields are important, but they are not daily-use information.

Hide them unless editing scripts or viewing advanced details.

## Too many confirmation modals

Do not interrupt the user with modals for every normal action.

Use inline confirmations/toasts.

Use confirmation dialogs only for destructive or irreversible actions.

## Excessive page descriptions

Keep descriptions short.

Do not explain the product repeatedly.

---

# 16. Acceptance Criteria

The simplification is successful when the following are true.

## Start Working

```text
The user can immediately see what to do next.
The next task is visually obvious.
Task cards are shorter and easier to scan.
Outcome selection is faster.
New leads do not distract from due follow-ups.
There is less metadata visible.
There are fewer buttons per card.
```

## Task Cards

```text
Each task card clearly shows who to contact.
Each task card clearly shows what to say.
Each task card clearly shows the main outcome buttons.
Secondary outcomes are hidden under More outcomes.
Lead metadata is reduced.
Script text is readable.
Copy actions are easy to find.
```

## Lead Detail

```text
Current task appears near the top.
Lead history is compact.
Only recent timeline items show by default.
Advanced workflow details are hidden.
Quick actions are reduced.
Destructive actions are not prominent.
```

## Leads Page

```text
The table has fewer columns.
Search and status filters are easy to use.
The page feels like a lead index, not a data dump.
Actions are simple.
```

## Script Pages

```text
Steps are easy to scan.
Outcomes are readable.
Advanced keys/metadata are available but hidden by default.
Versioning is understandable but not visually overwhelming.
```

## Forms

```text
Forms show required fields first.
Optional and advanced fields are collapsed.
Form labels are clear.
Validation is short.
Lead creation is fast.
```

## Navigation

```text
Only Start Working, Leads, Scripts, and Settings are primary nav items.
Start Working is the default route.
Navigation feels minimal and operational.
```

## Overall

```text
The app feels lighter.
The app feels faster.
The app feels more focused.
The app has less visible clutter.
The app prioritizes daily execution.
The app still preserves core workflow functionality.
```

---

# 17. Final Instruction To Codex

Simplify the existing TruckA Outreach app UI/UX according to this document.

Do not rebuild the app from scratch.

Do not remove the core workflow engine.

Do not remove the ability to:

```text
Create leads
Start outreach
View due tasks
Read scripts
Select outcomes
Schedule next steps
View lead history
Manage scripts
Use custom outcomes
Preserve workflow metrics architecture
```

But do remove, hide, collapse, merge, or de-emphasize anything that does not help the user execute daily outreach.

Focus on making the app answer these four questions quickly:

```text
What do I do now?
What do I say?
What happened?
What happens next?
```

The final result should be a simpler, faster, more obvious internal outreach execution tool.

It should feel operational, efficient, and focused.

It should not feel like a heavy CRM, marketing dashboard, or overbuilt admin panel.
