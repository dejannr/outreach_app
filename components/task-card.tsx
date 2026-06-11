import type { LeadStatus, StepChannel } from "@prisma/client";

import { OutcomeButtons } from "@/components/outcome-buttons";
import { LeadStatusBadge } from "@/components/lead-status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STEP_CHANNEL_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/dates";

type TaskCardProps = {
  task: {
    id: string;
    title: string;
    dueAt: Date;
    description?: string | null;
    lead: {
      id: string;
      companyName: string;
      contactName?: string | null;
      email?: string | null;
      phone?: string | null;
      status: LeadStatus;
    };
    step?: {
      id: string;
      name: string;
      channel: StepChannel;
      subject?: string | null;
      scriptText: string;
      instructions?: string | null;
      outcomesFrom: {
        id: string;
        label: string;
        requiresNote: boolean;
        requiresDateTime: boolean;
        requiresContact: boolean;
        nextStep?: { name: string } | null;
        isTerminal: boolean;
        setLeadStatus?: string | null;
      }[];
    } | null;
  };
  renderedScript: string;
  renderedSubject?: string;
  settings: {
    userName: string;
    companyName: string;
  };
  steps: {
    id: string;
    name: string;
  }[];
  scriptVersions: {
    id: string;
    name: string;
  }[];
};

export function TaskCard({
  task,
  renderedScript,
  renderedSubject,
  steps,
  scriptVersions,
}: TaskCardProps) {
  const step = task.step;

  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-semibold text-[var(--ink)]">
              {task.lead.companyName}
            </h3>
            <LeadStatusBadge status={task.lead.status} />
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-[var(--muted)]">
            <span>{task.lead.contactName || "Unknown contact"}</span>
            <span>{task.lead.email || "No email"}</span>
            <span>{task.lead.phone || "No phone"}</span>
          </div>
        </div>
        <div className="rounded-lg border bg-[var(--surface-subtle)] px-4 py-3 text-sm">
          <p className="font-medium text-[var(--ink)]">{task.title}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[13px] text-[var(--muted)]">
            <span>Due {formatDateTime(task.dueAt)}</span>
            {step ? <span>{STEP_CHANNEL_LABELS[step.channel]}</span> : null}
            {step ? <span>{step.name}</span> : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {step?.subject ? (
            <div className="rounded-lg border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-[var(--ink)]">
                    Subject line
                  </p>
                  <p className="text-sm text-[var(--muted-strong)]">
                    {renderedSubject}
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(renderedSubject || "")}
                >
                  Copy subject
                </Button>
              </div>
            </div>
          ) : null}
          <div className="rounded-lg border bg-[var(--surface-subtle)] p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[var(--ink)]">Script</p>
                <p className="text-xs text-[var(--muted)]">
                  Read, copy, and execute the exact outreach step.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => navigator.clipboard.writeText(renderedScript)}
                >
                  Copy script
                </Button>
                {step?.channel === "EMAIL" && task.lead.email ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => navigator.clipboard.writeText(renderedScript)}
                    >
                      Copy email body
                    </Button>
                    <Button asChild size="sm" variant="ghost">
                      <a
                        href={`mailto:${task.lead.email}?subject=${encodeURIComponent(renderedSubject || "")}&body=${encodeURIComponent(renderedScript)}`}
                      >
                        Email {task.lead.email}
                      </a>
                    </Button>
                  </>
                ) : null}
                {step?.channel === "PHONE" && task.lead.phone ? (
                  <Button asChild size="sm" variant="ghost">
                    <a href={`tel:${task.lead.phone}`}>Call {task.lead.phone}</a>
                  </Button>
                ) : null}
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-md border bg-white p-4 text-sm leading-[1.6] text-[var(--ink)]">
              {renderedScript}
            </pre>
          </div>
          {step?.instructions || task.description ? (
            <div className="rounded-lg border bg-white p-4 text-sm text-[var(--muted)]">
              <p className="font-medium text-[var(--ink)]">Instructions</p>
              <p className="mt-2 whitespace-pre-wrap leading-6">
                {step?.instructions || task.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white p-4">
            <p className="text-sm font-medium text-[var(--ink)]">
              Outcome selection
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
              Pick the exact outcome. The system will schedule the next action automatically.
            </p>
          </div>
          {step ? (
            <OutcomeButtons
              taskId={task.id}
              outcomes={step.outcomesFrom.map((outcome) => ({
                ...outcome,
                nextStepName: outcome.nextStep?.name,
                setLeadStatus: outcome.setLeadStatus,
              }))}
              steps={steps}
              scriptVersions={scriptVersions}
            />
          ) : null}
        </div>
      </div>
    </Card>
  );
}
