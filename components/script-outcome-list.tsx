import type { LeadStatus } from "@prisma/client";

import { Card } from "@/components/ui/card";

type OutcomeItem = {
  id: string;
  label: string;
  key: string;
  metricKey: string;
  delayDays: number;
  nextStepName?: string | null;
  setLeadStatus?: LeadStatus | null;
  isTerminal: boolean;
  requiresNote: boolean;
  requiresDateTime: boolean;
  requiresContact: boolean;
};

export function ScriptOutcomeList({ outcomes }: { outcomes: OutcomeItem[] }) {
  return (
    <div className="space-y-3">
      {outcomes.map((outcome) => (
        <Card key={outcome.id} className="space-y-2 rounded-2xl p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">{outcome.label}</p>
              <p className="font-mono text-xs text-[var(--muted)]">
                {outcome.key} · {outcome.metricKey}
              </p>
            </div>
            <div className="text-sm text-[var(--muted)]">
              {outcome.isTerminal
                ? "Terminal outcome"
                : `Next: ${outcome.nextStepName || "None"} in ${outcome.delayDays} day(s)`}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
            {outcome.setLeadStatus ? <span>Status: {outcome.setLeadStatus}</span> : null}
            {outcome.requiresNote ? <span>Requires note</span> : null}
            {outcome.requiresDateTime ? <span>Requires date/time</span> : null}
            {outcome.requiresContact ? <span>Requires contact</span> : null}
          </div>
        </Card>
      ))}
    </div>
  );
}
