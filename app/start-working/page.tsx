import Link from "next/link";
import { TaskStatus } from "@prisma/client";

import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { startLeadAction } from "@/app/actions/leads";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";
import { renderScriptText } from "@/lib/script-renderer";
import { getTodayWindow } from "@/lib/dates";
import { HIGH_VALUE_CHANNELS } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function StartWorkingPage() {
  const settings = await getAppSettings();
  const { start, end } = getTodayWindow();

  const [tasks, newLeads] = await Promise.all([
    prisma.task.findMany({
      where: { status: TaskStatus.OPEN, dueAt: { lte: end } },
      include: {
        lead: {
          include: {
            scriptVersion: {
              include: {
                script: {
                  include: {
                    versions: {
                      orderBy: {
                        version: "desc",
                      },
                    },
                  },
                },
              },
            },
          },
        },
        step: {
          include: {
            outcomesFrom: {
              where: { isArchived: false },
              include: {
                nextStep: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: [{ dueAt: "asc" }],
    }),
    prisma.lead.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "asc" },
      take: settings.dailyNewLeadLimit,
    }),
  ]);

  const stepsByVersionId = new Map<string, { id: string; name: string }[]>();
  for (const task of tasks) {
    const versionId = task.lead.scriptVersionId;
    if (!versionId || stepsByVersionId.has(versionId)) {
      continue;
    }
    const steps = await prisma.scriptStep.findMany({
      where: { scriptVersionId: versionId, isArchived: false },
      select: { id: true, name: true },
      orderBy: { sortOrder: "asc" },
    });
    stepsByVersionId.set(versionId, steps);
  }

  const overdueTasks = tasks.filter((task) => task.dueAt < start);
  const dueTodayTasks = tasks.filter((task) => task.dueAt >= start);
  const highValueTasks = tasks.filter((task) =>
    task.step ? HIGH_VALUE_CHANNELS.includes(task.step.channel) : false,
  );

  const activeLeadCount = await prisma.lead.count({
    where: {
      status: {
        in: ["ACTIVE", "WAITING", "DEMO_BOOKED", "DOCUMENTS_REQUESTED", "DOCUMENTS_RECEIVED", "LOOM_SENT"],
      },
    },
  });

  const summary = [
    { label: "Open tasks due today", value: dueTodayTasks.length },
    { label: "Overdue tasks", value: overdueTasks.length },
    { label: "New leads available", value: newLeads.length },
    { label: "Demos / document follow-ups", value: highValueTasks.length },
    { label: "Total active leads", value: activeLeadCount },
  ];

  const renderTask = (task: (typeof tasks)[number]) => {
    const versionId = task.lead.scriptVersionId || "";
    const steps = stepsByVersionId.get(versionId) || [];
    const versions =
      task.lead.scriptVersion?.script.versions.map((version) => ({
        id: version.id,
        name: version.name,
      })) || [];

    return (
      <TaskCard
        key={task.id}
        task={task}
        renderedScript={renderScriptText(task.step?.scriptText || "", task.lead, {
          userName: settings.userName,
          companySenderName: settings.companyName,
        })}
        renderedSubject={
          task.step?.subject
            ? renderScriptText(task.step.subject, task.lead, {
                userName: settings.userName,
                companySenderName: settings.companyName,
              })
            : undefined
        }
        settings={settings}
        steps={steps}
        scriptVersions={versions}
      />
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Start Working"
        description="Today's outreach tasks, overdue follow-ups, and new leads ready to enter the workflow."
        actions={
          <Button asChild>
            <Link href="/leads/new">Create lead</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {summary.map((item) => (
          <Card key={item.label} className="p-4">
            <p className="text-sm text-[var(--muted)]">{item.label}</p>
            <p className="mt-2 text-3xl font-semibold text-[var(--ink)]">
              {item.value}
            </p>
          </Card>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          <h2 className="text-lg font-semibold text-[var(--ink)]">Overdue Tasks</h2>
        </div>
        {overdueTasks.length ? overdueTasks.map(renderTask) : <EmptyState title="No overdue tasks" description="Nothing is past due. Move to today’s queue or start new leads." />}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Due Today</h2>
        {dueTodayTasks.length ? dueTodayTasks.map(renderTask) : <EmptyState title="No tasks due today" description="No tasks due today. You can start new leads or review active leads." />}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <h2 className="text-lg font-semibold text-[var(--ink)]">High-Value Follow-Ups</h2>
        </div>
        {highValueTasks.length ? highValueTasks.map(renderTask) : <EmptyState title="No high-value follow-ups" description="No demos, document requests, Loom follow-ups, or close steps are open right now." />}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">New Leads</h2>
        {newLeads.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {newLeads.map((lead) => (
              <Card key={lead.id} className="space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-[var(--ink)]">
                    {lead.companyName}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {lead.contactName || "Unknown contact"} · {lead.email || "No email"} · {lead.phone || "No phone"}
                  </p>
                </div>
                <form
                  action={async () => {
                    "use server";
                    await startLeadAction({ leadId: lead.id });
                  }}
                >
                  <Button type="submit">Start Outreach</Button>
                </form>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState title="No new leads available" description="Add more carrier leads or check active leads that already entered the workflow." />
        )}
      </section>
    </div>
  );
}
