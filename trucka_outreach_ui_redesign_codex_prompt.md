# Codex Prompt: Redesign App UI Into a Professional Internal Tool Design System

## Goal

Redesign the current app UI style into a cleaner, more neutral, professional, and operational internal-tool design language.

This app is an internal outreach workflow tool used for daily business execution. It is not a marketing website, lifestyle product, or brand-forward landing page.

The design should help the user work faster, understand priorities, read data clearly, and complete outreach tasks with minimal friction.

---

# Current Design Language To Remove

The current app feels too warm, editorial, cozy, and decorative.

Remove or strongly reduce:

```text
Warm earthy beige / cream backgrounds
Green lifestyle accents
Soft gradients
Textured or grainy surfaces
Handcrafted / editorial feeling
Large decorative rounded corners
Expressive typography
Atmospheric styling
Brand-forward visual personality
Cozy / soft / stylized mood
```

Do not preserve the current warm/editorial aesthetic.

---

# New Design Direction

Move the app toward:

```text
Neutral
Professional
Operational
Structured
Readable
Precise
Modern but not trendy
Polished but not flashy
Clear SaaS / internal-tool feeling
```

The app should feel closer to:

```text
Linear
Retool
Modern CRM
Internal operations dashboard
Clean B2B SaaS admin panel
```

Not like:

```text
Editorial website
Lifestyle app
Creative portfolio
Warm handcrafted brand page
Startup landing page
```

---

# Product Context

The app is an outreach workflow system for TruckA Company.

Main user workflow:

```text
Open Start Working
See today's outreach tasks
Read the script
Call or email the lead
Select the outcome
System schedules the next step
Move to the next task
```

The UI must prioritize:

```text
Task focus
Readable scripts
Fast outcome selection
Clear lead status
Clean tables
Operational confidence
```

---

# Core Visual Principles

## 1. Clarity over personality

The UI should not draw attention to itself.

The interface should make the next action obvious.

Avoid decorative visuals that do not help the workflow.

## 2. Hierarchy over atmosphere

Use clear hierarchy:

```text
Page title
Section heading
Task card
Primary action
Secondary metadata
Timeline details
```

Do not use gradients or texture to create mood.

Use spacing, borders, subtle background contrast, and typography.

## 3. Neutral surfaces

Use white and slate/gray surfaces.

Avoid cream, beige, brown, olive, moss, or warm paper-like tones.

## 4. Compact but breathable

This is an internal tool, so it should show enough information without feeling cramped.

Use moderate density.

Avoid oversized hero-like sections.

## 5. Consistent components

Cards, tables, buttons, badges, inputs, and navigation should follow one restrained system.

No one-off decorative styling.

---

# Suggested Color Tokens

Use a neutral slate-based palette with a restrained blue primary accent.

## Light Mode Tokens

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;

  --surface: #ffffff;
  --surface-muted: #f1f5f9;
  --surface-subtle: #f8fafc;

  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  --muted: #64748b;
  --muted-foreground: #475569;

  --primary: #2563eb;
  --primary-hover: #1d4ed8;
  --primary-foreground: #ffffff;

  --secondary: #f1f5f9;
  --secondary-hover: #e2e8f0;
  --secondary-foreground: #0f172a;

  --accent: #eff6ff;
  --accent-foreground: #1d4ed8;

  --success: #16a34a;
  --success-bg: #f0fdf4;
  --success-border: #bbf7d0;
  --success-text: #166534;

  --warning: #d97706;
  --warning-bg: #fffbeb;
  --warning-border: #fed7aa;
  --warning-text: #92400e;

  --danger: #dc2626;
  --danger-bg: #fef2f2;
  --danger-border: #fecaca;
  --danger-text: #991b1b;

  --info: #2563eb;
  --info-bg: #eff6ff;
  --info-border: #bfdbfe;
  --info-text: #1e40af;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
}
```

## Tailwind Color Direction

Use:

```text
slate
gray
blue
emerald
amber
red
```

Avoid:

```text
stone-heavy palettes
amber/brown backgrounds
cream backgrounds
warm gradients
moss green as main brand color
```

---

# Color Usage Rules

## Backgrounds

Use:

```text
App background: #f8fafc
Main panels/cards: #ffffff
Muted sections: #f1f5f9
```

Do not use:

```text
#faf3e6
#f5ead8
#efe2c5
warm beige
paper texture
grain overlays
```

## Primary actions

Use blue for primary actions.

Examples:

```text
Start Outreach
Complete Task
Save Script
Create Lead
Set Active Script
```

Use:

```text
Primary background: #2563eb
Hover: #1d4ed8
Text: white
```

## Secondary actions

Use neutral gray/slate.

Examples:

```text
Cancel
Back
View Details
Copy Script
Create Manual Task
```

## Destructive actions

Use red only for true destructive or terminal negative actions:

```text
Delete
Archive
Mark Not Interested
Close Lost
Disqualify
```

## Success actions

Use green/emerald only for positive state:

```text
Closed Won
Documents Received
Demo Booked
Task Completed
```

Do not use green as the main brand color.

---

# Typography Direction

Use a neutral, highly readable sans-serif.

Recommended:

```text
Inter
Geist Sans
system-ui
```

Do not use expressive, editorial, rounded, playful, or display-heavy typography.

## Font stack

```css
font-family: Inter, Geist, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

## Type Scale

Use this scale:

```text
Page title: 24px / 32px / 600
Section title: 18px / 28px / 600
Card title: 15px-16px / 24px / 600
Body: 14px / 22px / 400
Small metadata: 12px-13px / 18px / 400-500
Button: 14px / 20px / 500
Table header: 12px / 16px / 600 / uppercase optional
```

## Typography Rules

Use:

```text
Medium weight for labels and controls
Semibold for headings
Regular for body and scripts
Muted color for secondary metadata
```

Avoid:

```text
Very large display headings
Decorative letter spacing
Overly bold paragraphs
Editorial title styling
Marketing-style hero typography
```

---

# Spacing and Layout Principles

Use a consistent spacing system:

```text
4px base unit
```

Recommended spacing:

```text
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 24px
2xl: 32px
3xl: 40px
```

## Layout Rules

Use a structured app shell:

```text
Sidebar width: 240px-280px
Main content max width: none for dashboards/tables
Main content padding: 24px-32px
Section gap: 24px
Card padding: 16px-20px
Table row height: 44px-52px
Form field gap: 16px
```

Do not create landing-page-like vertical spacing.

Avoid huge empty hero sections.

The app should feel like a workbench.

---

# App Shell

Use a professional internal-tool shell.

## Sidebar

Sidebar should be:

```text
White or very light slate
Border-right: #e2e8f0
Width: 248px
No gradients
No texture
No oversized logo treatment
```

## Sidebar Items

Each item:

```text
Height: 36px-40px
Radius: 8px
Font size: 14px
Icon size: 16px-18px
```

Default state:

```text
Text: #475569
Background: transparent
```

Hover:

```text
Background: #f1f5f9
Text: #0f172a
```

Active:

```text
Background: #eff6ff
Text: #1d4ed8
Border or subtle left indicator optional
```

Do not use large pill navigation or colorful decorative icons.

---

# Header / Page Header

Each page should have a clear header:

```text
Title
Short description
Primary action button
Optional secondary action
```

Example:

```text
Start Working
Today's outreach tasks, overdue follow-ups, and new leads to start.
[Create Lead]
```

Page headers should be practical, not emotional.

Avoid:

```text
Big hero blocks
Decorative background shapes
Warm gradient page headers
Large inspirational copy
```

---

# Card Styling

Cards should be operational and clean.

Use:

```css
background: #ffffff;
border: 1px solid #e2e8f0;
border-radius: 12px;
box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
```

Card padding:

```text
16px or 20px
```

Card hover for clickable cards:

```css
border-color: #cbd5e1;
box-shadow: 0 2px 6px rgba(15, 23, 42, 0.06);
```

Avoid:

```text
Large 24px+ radius
Heavy shadows
Gradient card backgrounds
Textured surfaces
Decorative borders
Warm tinted card fills
```

---

# Task Card Styling

Task cards are the most important component.

They should show:

```text
Lead/company
Task title
Due date
Step/channel
Script text
Outcome buttons
Notes
```

## Task card layout

Recommended structure:

```text
Top row:
Company name + status badge
Due date + channel badge

Second row:
Contact details

Main body:
Step name
Script text in readable panel

Bottom:
Outcome buttons
Optional notes
```

## Script text panel

Script text should be easy to read and copy.

Use:

```css
background: #f8fafc;
border: 1px solid #e2e8f0;
border-radius: 8px;
font-size: 14px;
line-height: 1.6;
color: #0f172a;
padding: 16px;
```

Do not style scripts like quotes, handwritten notes, or editorial blocks.

Add buttons:

```text
Copy Script
Copy Subject
Open Mailto
Call Phone
```

---

# Table Styling

Tables should be clean and compact.

Use:

```text
White background
Thin borders
Subtle row hover
Clear header labels
Readable cell spacing
```

Recommended:

```css
table {
  background: #ffffff;
}

thead {
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}

tbody tr {
  border-top: 1px solid #e2e8f0;
}

tbody tr:hover {
  background: #f8fafc;
}
```

Row height:

```text
44px-52px
```

Avoid:

```text
Huge rounded table containers
Gradient headers
Decorative row backgrounds
Too much vertical padding
```

---

# Form Styling

Forms should feel precise and reliable.

## Inputs

Use:

```css
height: 40px;
border: 1px solid #cbd5e1;
border-radius: 8px;
background: #ffffff;
font-size: 14px;
```

Focus state:

```css
border-color: #2563eb;
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
```

Labels:

```text
13px
font-weight: 500
color: #334155
```

Help text:

```text
12px-13px
color: #64748b
```

Textarea:

```text
min-height: 120px
font-size: 14px
line-height: 1.5
```

Avoid:

```text
Oversized pill inputs
Warm-tinted input backgrounds
Decorative focus rings
Playful placeholder text
```

---

# Button Styling

Use restrained SaaS buttons.

## Primary button

```css
height: 40px;
padding: 0 14px;
border-radius: 8px;
background: #2563eb;
color: #ffffff;
font-size: 14px;
font-weight: 500;
```

Hover:

```css
background: #1d4ed8;
```

## Secondary button

```css
height: 40px;
padding: 0 14px;
border-radius: 8px;
background: #ffffff;
border: 1px solid #cbd5e1;
color: #0f172a;
```

Hover:

```css
background: #f8fafc;
```

## Ghost button

```css
background: transparent;
color: #475569;
```

Hover:

```css
background: #f1f5f9;
color: #0f172a;
```

## Destructive button

```css
background: #dc2626;
color: #ffffff;
```

Hover:

```css
background: #b91c1c;
```

Avoid:

```text
Large pill buttons
Gradient buttons
Oversized shadows
Playful hover animations
Warm brand-colored CTAs
```

---

# Status Badges

Badges should be small, readable, and consistent.

Use subtle background + border + text.

## Recommended badge tokens

```css
.badge-neutral {
  background: #f8fafc;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.badge-active {
  background: #eff6ff;
  color: #1e40af;
  border: 1px solid #bfdbfe;
}

.badge-waiting {
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #fed7aa;
}

.badge-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.badge-danger {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

.badge-paused {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #cbd5e1;
}
```

## Badge mapping

```text
NEW → neutral
ACTIVE → active
WAITING → waiting
DEMO_BOOKED → active
DOCUMENTS_REQUESTED → waiting
DOCUMENTS_RECEIVED → success
LOOM_SENT → active
PILOT_PROPOSED → active
CLOSED_WON → success
CLOSED_LOST → danger
DISQUALIFIED → danger
NOT_INTERESTED → danger
PAUSED → paused
```

Do not use loud saturated badges unless it is truly urgent.

---

# Data Visualization Tone

For future analytics, use restrained charts.

Recommended chart colors:

```text
Primary: #2563eb
Success: #16a34a
Warning: #d97706
Danger: #dc2626
Neutral: #64748b
```

Rules:

```text
Use clean axes
Use minimal gridlines
Use readable labels
Avoid decorative chart gradients
Avoid 3D effects
Avoid unnecessary icons
Avoid too many colors
```

Charts should answer operational questions, not decorate the dashboard.

---

# Start Working Page Redesign Rules

The Start Working page is the core of the app.

It should feel like a command center.

## Layout

Recommended:

```text
Page header
Summary metric cards
Priority task sections
New leads section
```

## Summary cards

Use small operational cards:

```text
Open tasks today
Overdue
High-value follow-ups
New leads available
```

Cards should be compact.

Do not make them large marketing stats.

## Task sections

Use section headers:

```text
Overdue
Due Today
High-Value Follow-Ups
New Leads
```

Each section should show clear empty states.

## Priority

Use visual hierarchy:

```text
Overdue tasks: subtle red/amber indicator
High-value tasks: blue indicator
Normal tasks: neutral
```

Do not make the page colorful or noisy.

---

# Lead Detail Page Redesign Rules

The lead detail page should be structured like an operations record.

Recommended layout:

```text
Header:
Company name, status badge, contact info

Left/main column:
Current task
Timeline

Right/sidebar:
Lead details
Quick actions
Current script state
```

Keep the current task visually prominent.

Timeline should be clean and chronological.

Do not use decorative timeline graphics.

---

# Script Builder Redesign Rules

The script builder should feel like a configuration tool.

Use:

```text
Steps list
Outcome list
Forms
Stable key fields
Status indicators
Version badge
```

Do not make it look like a creative canvas yet.

For v1, a form/list builder is better than an overly designed visual flow.

Visual builder can come later.

## Script step cards

Each step card should show:

```text
Step name
Step key
Channel
Is start step
Is archived
Number of outcomes
```

## Outcome rows

Each outcome row should show:

```text
Label
Outcome key
Next step
Delay days
Terminal status
Lead status change
```

Keys should be visible because metrics depend on them.

---

# Layout Density

Use medium density.

Not too sparse.

Not too cramped.

Guidelines:

```text
Page padding: 24px-32px
Card padding: 16px-20px
Section gap: 24px
Form gap: 16px
Table row height: 48px
Button height: 36px-40px
Badge height: 22px-24px
```

Avoid:

```text
Large landing-page spacing
Oversized cards
Huge empty areas
Very tall buttons
```

---

# Motion and Interaction

Keep motion minimal.

Allowed:

```text
150ms hover transitions
Subtle border/background changes
Simple dialog open/close
```

Avoid:

```text
Bouncy animations
Decorative transitions
Parallax
Animated gradients
Playful microinteractions
```

This is a work tool.

---

# Icon Style

Use simple line icons.

Recommended:

```text
lucide-react
```

Rules:

```text
16px-18px icons
Stroke width 1.75-2
Neutral color by default
No colorful decorative icon backgrounds unless needed
```

Avoid:

```text
Large illustrative icons
Gradient icons
Mascots
Hand-drawn icons
```

---

# Implementation Instructions For Codex

Refactor the app styling according to this design system.

## Required implementation changes

1. Replace the warm/editorial palette with the neutral slate/blue palette.
2. Remove textured, grainy, and decorative backgrounds.
3. Remove warm beige/cream app surfaces.
4. Remove large decorative radii where unnecessary.
5. Standardize cards to white surface, slate border, subtle shadow.
6. Standardize buttons to restrained SaaS style.
7. Standardize inputs, tables, badges, and navigation.
8. Ensure the Start Working page looks like an operational dashboard.
9. Ensure task cards are readable and action-focused.
10. Ensure script text is shown in a clean readable panel.
11. Ensure tables are compact and clear.
12. Ensure sidebar is neutral, structured, and professional.
13. Ensure typography uses a neutral sans-serif and consistent type scale.
14. Remove any marketing/editorial visual treatment.
15. Keep the UI polished but not flashy.

---

# Tailwind / CSS Variables

Implement or update theme variables with this direction.

Use these as the base values:

```css
:root {
  --background: 248 250 252;
  --foreground: 15 23 42;

  --card: 255 255 255;
  --card-foreground: 15 23 42;

  --popover: 255 255 255;
  --popover-foreground: 15 23 42;

  --primary: 37 99 235;
  --primary-foreground: 255 255 255;

  --secondary: 241 245 249;
  --secondary-foreground: 15 23 42;

  --muted: 241 245 249;
  --muted-foreground: 100 116 139;

  --accent: 239 246 255;
  --accent-foreground: 29 78 216;

  --destructive: 220 38 38;
  --destructive-foreground: 255 255 255;

  --border: 226 232 240;
  --input: 203 213 225;
  --ring: 37 99 235;

  --radius: 0.5rem;
}
```

If the app uses shadcn/ui, align the theme with these variables.

---

# Component Styling Checklist

## App background

```text
Use bg-slate-50
```

## Main content cards

```text
bg-white border border-slate-200 rounded-xl shadow-sm
```

## Sidebar

```text
bg-white border-r border-slate-200
```

## Sidebar active item

```text
bg-blue-50 text-blue-700
```

## Sidebar inactive item

```text
text-slate-600 hover:bg-slate-100 hover:text-slate-950
```

## Primary button

```text
bg-blue-600 hover:bg-blue-700 text-white rounded-md
```

## Secondary button

```text
bg-white border border-slate-300 hover:bg-slate-50 text-slate-900
```

## Inputs

```text
bg-white border border-slate-300 focus:ring-blue-600
```

## Tables

```text
bg-white border border-slate-200 rounded-xl
thead bg-slate-50 text-slate-500
rows border-slate-200 hover:bg-slate-50
```

## Muted metadata

```text
text-slate-500
```

## Body text

```text
text-slate-900
```

## Section headings

```text
text-slate-950 font-semibold
```

---

# Specific Pages To Review

Apply the redesign especially to:

```text
/start-working
/leads
/leads/[id]
/scripts
/scripts/[id]
/settings
```

The Start Working page should receive the most attention.

---

# Anti-Patterns To Remove

Remove:

```text
Warm gradients
Earth-tone hero areas
Grain/noise overlays
Decorative cards
Very large border radius everywhere
Oversized expressive headings
Playful colors
Overly soft visual contrast
Marketing-site spacing
Illustrative empty states that feel decorative
```

Replace with:

```text
Clear headings
Compact metric cards
Readable task cards
Clean tables
Neutral sidebar
Consistent badges
Simple empty states
Precise forms
```

---

# Final Visual Target

The redesigned app should feel like:

```text
A serious daily operations tool for managing outreach workflows.
```

It should not feel like:

```text
A warm lifestyle brand experience.
```

When Dejan opens the app, the visual message should be:

```text
Here is today's work.
Here is what matters.
Here is what to say.
Click what happened.
Move to the next lead.
```

That is the design goal.

---

# Acceptance Criteria

The redesign is successful when:

```text
The app no longer feels warm/editorial/lifestyle.
The UI feels neutral, professional, and operational.
The Start Working page is clearer and more task-focused.
Task cards are easy to scan and act on.
Scripts are easy to read and copy.
Tables are clean and readable.
Forms feel precise and reliable.
Sidebar navigation feels like a SaaS/internal tool.
Status badges are consistent and restrained.
Colors are mostly slate/white/blue with semantic accents only.
There are no textured or decorative backgrounds.
There are no unnecessary gradients.
The design supports daily business workflow use.
```

---

# Final Instruction To Codex

Redesign the existing app UI according to this document.

Do not change the app's core functionality unless required for layout clarity.

Focus on:

```text
Visual system
Layout structure
Component consistency
Readability
Operational usability
Professional internal-tool feel
```

Do not introduce:

```text
New product features
AI
Marketing pages
Decorative animations
Warm brand visuals
```

The result should be a restrained, modern, credible SaaS/internal-tool interface.
