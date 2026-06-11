import { notFound } from "next/navigation";

import { ActivityTimeline } from "@/components/activity-timeline";
import { LeadQuickActions } from "@/components/lead-quick-actions";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { ManualTaskForm } from "@/components/forms/manual-task-form";
import { NoteForm } from "@/components/forms/note-form";
import { LeadOverrideForm } from "@/components/forms/lead-override-form";
import { PageHeader } from "@/components/page-header";
import { TaskCard } from "@/components/task-card";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { renderScriptText } from "@/lib/script-renderer";

export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
              <h2 className="text-3xl font-extrabold">{lead.companyName}</h2>
              <LeadStatusBadge status={lead.status} />
            </div>
            <p className="text-sm text-[var(--muted)]">
              {lead.contactName || "Unknown contact"} · {lead.phone || "No phone"} · {lead.email || "No email"} · {lead.website || "No website"}
            </p>
            <p className="text-sm text-[var(--muted)]">
              Current step: {lead.currentStep?.name || "Not started"} · Next task: {lead.nextTaskAt ? lead.nextTaskAt.toLocaleString() : "Not scheduled"}
            </p>
          </div>
          <LeadQuickActions leadId={lead.id} />
        </div>
      </Card>

      {openTask ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Current Task</h2>
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

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Card className="space-y-4">
            <h2 className="text-xl font-bold">Quick Actions</h2>
            <ManualTaskForm leadId={lead.id} steps={lead.scriptVersion?.steps || []} />
            <LeadOverrideForm leadId={lead.id} steps={lead.scriptVersion?.steps || []} currentStatus={lead.status} />
            <NoteForm leadId={lead.id} />
          </Card>
          <ActivityTimeline items={timelineItems} />
        </div>

        <Card className="space-y-4">
          <h2 className="text-xl font-bold">Lead Details</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold">Company</dt>
              <dd className="text-[var(--muted)]">{lead.companyName}</dd>
            </div>
            <div>
              <dt className="font-semibold">Contact</dt>
              <dd className="text-[var(--muted)]">{lead.contactName || "Unknown"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Email</dt>
              <dd className="text-[var(--muted)]">{lead.email || "None"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Phone</dt>
              <dd className="text-[var(--muted)]">{lead.phone || "None"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Role</dt>
              <dd className="text-[var(--muted)]">{lead.role || "None"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Source</dt>
              <dd className="text-[var(--muted)]">{lead.source || "None"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Current step</dt>
              <dd className="text-[var(--muted)]">{lead.currentStep?.name || "None"}</dd>
            </div>
            <div>
              <dt className="font-semibold">Next task date</dt>
              <dd className="text-[var(--muted)]">{lead.nextTaskAt?.toLocaleString() || "None"}</dd>
            </div>
          </dl>
          <div>
            <p className="font-semibold">Custom fields</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-2xl border bg-white p-4 text-xs">
              {JSON.stringify(lead.customFields || {}, null, 2)}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
}
