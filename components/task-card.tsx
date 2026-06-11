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
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-2xl font-bold">{task.lead.companyName}</h3>
            <LeadStatusBadge status={task.lead.status} />
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
            <span>{task.lead.contactName || "Unknown contact"}</span>
            <span>{task.lead.email || "No email"}</span>
            <span>{task.lead.phone || "No phone"}</span>
          </div>
        </div>
        <div className="rounded-2xl border bg-white px-4 py-3 text-right text-sm">
          <p className="font-semibold">{task.title}</p>
          <p className="text-[var(--muted)]">Due {formatDateTime(task.dueAt)}</p>
          {step ? (
            <p className="text-[var(--muted)]">
              {step.name} · {STEP_CHANNEL_LABELS[step.channel]}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-4">
          {step?.subject ? (
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Subject line</p>
                  <p className="text-sm text-[var(--muted)]">{renderedSubject}</p>
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
          <div className="rounded-2xl border bg-white p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">Script</p>
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
            <pre className="whitespace-pre-wrap text-sm leading-7">{renderedScript}</pre>
          </div>
          {step?.instructions || task.description ? (
            <div className="rounded-2xl border bg-[var(--card-strong)] p-4 text-sm text-[var(--muted)]">
              <p className="font-semibold text-[var(--ink)]">Instructions</p>
              <p className="mt-2 whitespace-pre-wrap">
                {step?.instructions || task.description}
              </p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border bg-white p-4">
            <p className="font-semibold">Outcome selection</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
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
