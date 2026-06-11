import Link from "next/link";
import type { StepChannel } from "@prisma/client";

import { ScriptOutcomeList } from "@/components/script-outcome-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { STEP_CHANNEL_LABELS } from "@/lib/constants";

type StepCardProps = {
  scriptId: string;
  step: {
    id: string;
    name: string;
    key: string;
    metricKey: string;
    channel: StepChannel;
    subject?: string | null;
    scriptText: string;
    instructions?: string | null;
    defaultDelayDays: number;
    sortOrder: number;
    isStartStep: boolean;
    isTerminalStep: boolean;
    outcomesFrom: {
      id: string;
      label: string;
      key: string;
      metricKey: string;
      delayDays: number;
      nextStep?: { name: string } | null;
      setLeadStatus?: string | null;
      isTerminal: boolean;
      requiresNote: boolean;
      requiresDateTime: boolean;
      requiresContact: boolean;
    }[];
  };
};

export function ScriptStepCard({ step, scriptId }: StepCardProps) {
  return (
    <Card className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold">{step.name}</h3>
            {step.isStartStep ? (
              <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent-strong)]">
                Start step
              </span>
            ) : null}
            {step.isTerminalStep ? (
              <span className="rounded-full bg-[var(--warning-soft)] px-3 py-1 text-xs font-semibold text-[var(--warning)]">
                Terminal step
              </span>
            ) : null}
          </div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            {step.key} · {step.metricKey} · {STEP_CHANNEL_LABELS[step.channel]}
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link href={`/scripts/${scriptId}/steps/${step.id}`}>Edit step</Link>
        </Button>
      </div>
      {step.subject ? (
        <div>
          <p className="font-semibold">Subject</p>
          <p className="text-sm text-[var(--muted)]">{step.subject}</p>
        </div>
      ) : null}
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          <div>
            <p className="font-semibold">Script text</p>
            <pre className="mt-2 whitespace-pre-wrap rounded-2xl border bg-white p-4 text-sm leading-7">
              {step.scriptText}
            </pre>
          </div>
          {step.instructions ? (
            <div>
              <p className="font-semibold">Instructions</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">
                {step.instructions}
              </p>
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <div className="rounded-2xl border bg-white p-4 text-sm">
            <p className="font-semibold">Step settings</p>
            <p className="mt-2 text-[var(--muted)]">
              Default delay: {step.defaultDelayDays} day(s)
            </p>
            <p className="text-[var(--muted)]">Sort order: {step.sortOrder}</p>
          </div>
          <div>
            <p className="mb-3 font-semibold">Outcomes</p>
            <ScriptOutcomeList
              outcomes={step.outcomesFrom.map((outcome) => ({
                ...outcome,
                nextStepName: outcome.nextStep?.name,
                setLeadStatus: outcome.setLeadStatus as never,
              }))}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
