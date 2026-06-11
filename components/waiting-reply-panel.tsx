"use client";

import { startTransition, useState } from "react";
import { toast } from "sonner";

import { recordReplyAction } from "@/app/actions/tasks";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ReplyOutcome = {
  id: string;
  label: string;
  requiresNote: boolean;
  requiresDateTime: boolean;
  requiresContact: boolean;
  nextStepName?: string | null;
  isTerminal: boolean;
};

function isPrimaryReplyOutcome(label: string) {
  const normalized = label.toLowerCase();
  return [
    "positive reply",
    "interested",
    "not interested",
    "wrong person",
    "bad contact",
    "documents received",
    "demo booked",
  ].some((value) => normalized.includes(value));
}

export function WaitingReplyPanel({
  leadId,
  sourceStepName,
  outcomes,
}: {
  leadId: string;
  sourceStepName: string;
  outcomes: ReplyOutcome[];
}) {
  const formId = `record-reply-${leadId}`;
  const [selectedOutcome, setSelectedOutcome] = useState<ReplyOutcome | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [note, setNote] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactRole, setContactRole] = useState("");

  const needsExtraFields = Boolean(
    selectedOutcome?.requiresNote ||
      selectedOutcome?.requiresDateTime ||
      selectedOutcome?.requiresContact,
  );

  const primaryOutcomes = outcomes
    .filter((outcome) => isPrimaryReplyOutcome(outcome.label))
    .slice(0, 4);
  const secondaryOutcomes = outcomes.filter(
    (outcome) => !primaryOutcomes.some((primary) => primary.id === outcome.id),
  );

  const resetState = () => {
    setSelectedOutcome(null);
    setNote("");
    setScheduledAt("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactRole("");
  };

  const submitReply = async () => {
    if (!selectedOutcome) {
      return;
    }

    const result = await recordReplyAction({
      leadId,
      outcomeId: selectedOutcome.id,
      note,
      scheduledAt,
      contactName,
      contactEmail,
      contactPhone,
      contactRole,
    });

    if (!result.success) {
      toast.error(result.error || "Could not record reply");
      return;
    }

    toast.success(
      selectedOutcome.isTerminal
        ? "Reply recorded. Sequence stopped."
        : `Reply recorded. Next step${selectedOutcome.nextStepName ? `: ${selectedOutcome.nextStepName}` : ""}.`,
    );
    resetState();
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-[var(--surface-subtle)] p-4">
        <p className="text-sm font-medium text-[var(--ink)]">Reply came in?</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
          The lead replied after <span className="font-medium text-[var(--muted-strong)]">{sourceStepName}</span>. Record what happened and the scheduled follow-up will be replaced.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {primaryOutcomes.map((outcome) => (
          <Button
            key={outcome.id}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setSelectedOutcome(outcome)}
          >
            {outcome.label}
          </Button>
        ))}
        {secondaryOutcomes.length ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowMore((current) => !current)}
          >
            {showMore ? "Hide outcomes" : "More reply outcomes"}
          </Button>
        ) : null}
      </div>

      {showMore && secondaryOutcomes.length ? (
        <div className="flex flex-wrap gap-2 rounded-lg border bg-white p-4">
          {secondaryOutcomes.map((outcome) => (
            <Button
              key={outcome.id}
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setSelectedOutcome(outcome)}
            >
              {outcome.label}
            </Button>
          ))}
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(selectedOutcome)}
        title={selectedOutcome ? `Record reply: ${selectedOutcome.label}` : ""}
        description={
          selectedOutcome
            ? needsExtraFields
              ? "Provide the required details and confirm the reply."
              : "Confirm the reply and continue the workflow."
            : undefined
        }
        confirmLabel="Record reply"
        onClose={resetState}
        onConfirm={needsExtraFields ? undefined : () => startTransition(submitReply)}
        confirmForm={needsExtraFields ? formId : undefined}
        confirmType={needsExtraFields ? "submit" : "button"}
      >
        {selectedOutcome ? (
          <form
            id={formId}
            className="space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              startTransition(submitReply);
            }}
          >
            {selectedOutcome.requiresNote ? (
              <Textarea
                placeholder="Optional note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            ) : null}
            {selectedOutcome.requiresDateTime ? (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(event) => setScheduledAt(event.target.value)}
              />
            ) : null}
            {selectedOutcome.requiresContact ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Input
                  placeholder="Contact name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                />
                <Input
                  placeholder="Contact email"
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                />
                <Input
                  placeholder="Contact phone"
                  value={contactPhone}
                  onChange={(event) => setContactPhone(event.target.value)}
                />
                <Input
                  placeholder="Contact role"
                  value={contactRole}
                  onChange={(event) => setContactRole(event.target.value)}
                />
              </div>
            ) : null}
          </form>
        ) : null}
      </ConfirmDialog>
    </div>
  );
}
