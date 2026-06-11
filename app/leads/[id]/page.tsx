import { notFound } from "next/navigation";
import Link from "next/link";

import { ActivityTimeline } from "@/components/activity-timeline";
import { LeadQuickActions } from "@/components/lead-quick-actions";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { ManualTaskForm } from "@/components/forms/manual-task-form";
import { NoteForm } from "@/components/forms/note-form";
import { LeadOverrideForm } from "@/components/forms/lead-override-form";
import { PageHeader } from "@/components/page-header";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { renderScriptText } from "@/lib/script-renderer";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = (await searchParams) || {};
  const showFullHistory = query.history === "full";
  const settings = await getAppSettings();
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: {
      currentStep: true,
      scriptVersion: {
        include: {
          script: {
            include: {
              versions: true,
            },
          },
          steps: {
            where: { isArchived: false },
            select: { id: true, name: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      tasks: {
        where: { status: "OPEN" },
        include: {
          lead: true,
          step: {
            include: {
              outcomesFrom: {
                where: { isArchived: false },
                include: { nextStep: true },
                orderBy: { sortOrder: "asc" },
              },
            },
          },
        },
        orderBy: { dueAt: "asc" },
      },
      activities: {
        orderBy: { createdAt: "desc" },
      },
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!lead) {
    notFound();
  }

  const openTask = lead.tasks[0];
  const versions =
    lead.scriptVersion?.script.versions.map((version) => ({
      id: version.id,
      name: version.name,
    })) || [];

  const timelineItems = [
    ...lead.activities.map((activity) => ({
      id: activity.id,
      title: activity.title,
      body: activity.body,
      createdAt: activity.createdAt,
      kind: "activity" as const,
    })),
    ...lead.notes.map((note) => ({
      id: note.id,
      title: "Note",
      body: note.body,
      createdAt: note.createdAt,
      kind: "note" as const,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const timelinePreview = showFullHistory ? timelineItems : timelineItems.slice(0, 8);

  return (
    <div className="space-y-6">
      <PageHeader
        title={lead.companyName}
        description="Lead detail, current script state, open task, and complete timeline."
      />

      <Card className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-semibold text-[var(--ink)]">
                {lead.companyName}
              </h2>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="text-sm leading-6 text-[var(--muted)]">
              {lead.contactName || "Unknown contact"} · {lead.phone || "No phone"} · {lead.email || "No email"} · {lead.website || "No website"}
            </p>
            <p className="text-sm leading-6 text-[var(--muted)]">
              Current step: {lead.currentStep?.name || "Not started"} · Next task: {lead.nextTaskAt ? lead.nextTaskAt.toLocaleString() : "Not scheduled"}
            </p>
          </div>
          <div className="space-y-2">
            <LeadQuickActions leadId={lead.id} />
            <p className="text-xs text-[var(--muted)]">
              Common actions only. Advanced workflow controls are below.
            </p>
          </div>
        </div>
      </Card>

      {openTask ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Current Task</h2>
          <TaskCard
            task={openTask}
            renderedScript={renderScriptText(openTask.step?.scriptText || "", lead, {
              userName: settings.userName,
              companySenderName: settings.companyName,
            })}
            renderedSubject={
              openTask.step?.subject
                ? renderScriptText(openTask.step.subject, lead, {
                    userName: settings.userName,
                    companySenderName: settings.companyName,
                  })
                : undefined
            }
            settings={settings}
            steps={lead.scriptVersion?.steps || []}
            scriptVersions={versions}
          />
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-lg font-semibold text-[var(--ink)]">Quick Actions</h2>
            <ManualTaskForm leadId={lead.id} steps={lead.scriptVersion?.steps || []} />
            <NoteForm leadId={lead.id} />
            <details className="rounded-lg border bg-[var(--surface-subtle)] p-4">
              <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
                Advanced actions
              </summary>
              <div className="mt-4">
                <LeadOverrideForm leadId={lead.id} steps={lead.scriptVersion?.steps || []} currentStatus={lead.status} />
              </div>
            </details>
          </Card>
          <div className="space-y-3">
            <ActivityTimeline items={timelinePreview} />
            {timelineItems.length > 8 ? (
              <Button asChild variant="ghost" size="sm">
                <Link href={showFullHistory ? `/leads/${lead.id}` : `/leads/${lead.id}?history=full`}>
                  {showFullHistory ? "Show less history" : "Show full history"}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>

        <Card className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">Lead Details</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-medium text-[var(--ink)]">Company</dt>
              <dd className="text-[var(--muted)]">{lead.companyName}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Contact</dt>
              <dd className="text-[var(--muted)]">{lead.contactName || "Unknown"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Email</dt>
              <dd className="text-[var(--muted)]">{lead.email || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Phone</dt>
              <dd className="text-[var(--muted)]">{lead.phone || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Role</dt>
              <dd className="text-[var(--muted)]">{lead.role || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Source</dt>
              <dd className="text-[var(--muted)]">{lead.source || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Current step</dt>
              <dd className="text-[var(--muted)]">{lead.currentStep?.name || "None"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--ink)]">Next task date</dt>
              <dd className="text-[var(--muted)]">{lead.nextTaskAt?.toLocaleString() || "None"}</dd>
            </div>
          </dl>
          <details className="rounded-lg border bg-[var(--surface-subtle)] p-4">
            <summary className="cursor-pointer text-sm font-medium text-[var(--ink)]">
              Advanced workflow details
            </summary>
            <div className="mt-4 space-y-4">
              <div className="text-sm text-[var(--muted)]">
                <p>Script version: {lead.scriptVersion?.name || "Not assigned"}</p>
                <p>Current step: {lead.currentStep?.name || "None"}</p>
              </div>
              <div>
                <p className="font-medium text-[var(--ink)]">Custom fields</p>
                <pre className="mt-2 whitespace-pre-wrap rounded-md border bg-white p-4 text-xs text-[var(--muted-strong)]">
                  {JSON.stringify(lead.customFields || {}, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </Card>
      </div>
    </div>
  );
}
