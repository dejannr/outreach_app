"use client";

import { LeadStatus } from "@prisma/client";
import { startTransition, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  completeCustomOutcomeAction,
  completeTaskAction,
} from "@/app/actions/tasks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Outcome = {
  id: string;
  label: string;
  requiresNote: boolean;
  requiresDateTime: boolean;
  requiresContact: boolean;
  nextStepName?: string | null;
  isTerminal: boolean;
  setLeadStatus?: string | null;
};

type StepOption = {
  id: string;
  name: string;
};

type VersionOption = {
  id: string;
  name: string;
};

type OutcomeFormValues = {
  note: string;
  scheduledAt: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
};

type CustomOutcomeValues = {
  explanation: string;
  manualTitle: string;
  manualDueAt: string;
  existingStepId: string;
  terminalStatus: string;
  migrateToScriptVersionId: string;
};

export function OutcomeButtons({
  taskId,
  outcomes,
  steps,
  scriptVersions,
}: {
  taskId: string;
  outcomes: Outcome[];
  steps: StepOption[];
  scriptVersions: VersionOption[];
}) {
  const [selectedOutcome, setSelectedOutcome] = useState<Outcome | null>(null);
  const [showCustom, setShowCustom] = useState(false);

  const outcomeForm = useForm<OutcomeFormValues>({
    defaultValues: {
      note: "",
      scheduledAt: "",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      contactRole: "",
    },
  });

  const customForm = useForm<CustomOutcomeValues>({
    defaultValues: {
      explanation: "",
      manualTitle: "",
      manualDueAt: "",
      existingStepId: "",
      terminalStatus: "",
      migrateToScriptVersionId: "",
    },
  });

  const completeSelectedOutcome = (values: OutcomeFormValues) => {
    if (!selectedOutcome) {
      return;
    }

    startTransition(async () => {
      const result = await completeTaskAction({
        taskId,
        outcomeId: selectedOutcome.id,
        note: values.note,
        scheduledAt: values.scheduledAt,
        contactName: values.contactName,
        contactEmail: values.contactEmail,
        contactPhone: values.contactPhone,
        contactRole: values.contactRole,
      });

      if (!result.success) {
        toast.error(result.error || "Something went wrong");
        return;
      }

      toast.success(
        selectedOutcome.isTerminal
          ? `Lead marked as ${selectedOutcome.setLeadStatus ?? "updated"}. No next task scheduled.`
          : `Next step scheduled${selectedOutcome.nextStepName ? `: ${selectedOutcome.nextStepName}` : ""}.`,
      );
      setSelectedOutcome(null);
      outcomeForm.reset();
    });
  };

  const needsExtraFields = Boolean(
    selectedOutcome?.requiresNote ||
      selectedOutcome?.requiresDateTime ||
      selectedOutcome?.requiresContact,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {outcomes.map((outcome) => (
          <Button
            key={outcome.id}
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowCustom(false);
              if (
                !outcome.requiresNote &&
                !outcome.requiresDateTime &&
                !outcome.requiresContact
              ) {
                if (!window.confirm(`Complete task with outcome "${outcome.label}"?`)) {
                  return;
                }

                setSelectedOutcome(outcome);
                completeSelectedOutcome(outcomeForm.getValues());
                return;
              }

              setSelectedOutcome(outcome);
            }}
          >
            {outcome.label}
          </Button>
        ))}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setSelectedOutcome(null);
            setShowCustom((current) => !current);
          }}
        >
          Other / Custom Outcome
        </Button>
      </div>

      {selectedOutcome && needsExtraFields ? (
        <form
          className="space-y-3 rounded-2xl border bg-white p-4"
          onSubmit={outcomeForm.handleSubmit(completeSelectedOutcome)}
        >
          <p className="font-semibold">{selectedOutcome.label}</p>
          {selectedOutcome.requiresNote ? (
            <Textarea
              placeholder="Optional completion note"
              {...outcomeForm.register("note")}
            />
          ) : null}
          {selectedOutcome.requiresDateTime ? (
            <Input type="datetime-local" {...outcomeForm.register("scheduledAt")} />
          ) : null}
          {selectedOutcome.requiresContact ? (
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Contact name" {...outcomeForm.register("contactName")} />
              <Input placeholder="Contact email" {...outcomeForm.register("contactEmail")} />
              <Input placeholder="Contact phone" {...outcomeForm.register("contactPhone")} />
              <Input placeholder="Contact role" {...outcomeForm.register("contactRole")} />
            </div>
          ) : null}
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Complete task
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setSelectedOutcome(null)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}

      {showCustom ? (
        <form
          className="space-y-3 rounded-2xl border bg-white p-4"
          onSubmit={customForm.handleSubmit((values) => {
            startTransition(async () => {
              const result = await completeCustomOutcomeAction({
                taskId,
                explanation: values.explanation,
                manualTitle: values.manualTitle,
                manualDueAt: values.manualDueAt,
                existingStepId: values.existingStepId,
                terminalStatus: values.terminalStatus
                  ? (values.terminalStatus as LeadStatus)
                  : undefined,
                migrateToScriptVersionId: values.migrateToScriptVersionId,
              });

              if (!result.success) {
                toast.error(result.error || "Something went wrong");
                return;
              }

              toast.success(result.message || "Custom outcome recorded");
              customForm.reset();
              setShowCustom(false);
            });
          })}
        >
          <p className="font-semibold">Custom outcome</p>
          <Textarea
            placeholder="What happened?"
            {...customForm.register("explanation", { required: true })}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Manual task title"
              {...customForm.register("manualTitle")}
            />
            <Input type="datetime-local" {...customForm.register("manualDueAt")} />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <Select {...customForm.register("existingStepId")}>
              <option value="">Move to existing step</option>
              {steps.map((step) => (
                <option key={step.id} value={step.id}>
                  {step.name}
                </option>
              ))}
            </Select>
            <Select {...customForm.register("terminalStatus")}>
              <option value="">Stop sequence / terminal status</option>
              <option value={LeadStatus.DISQUALIFIED}>Mark disqualified</option>
              <option value={LeadStatus.NOT_INTERESTED}>Mark not interested</option>
              <option value={LeadStatus.CLOSED_LOST}>Mark closed lost</option>
            </Select>
          </div>
          <Select {...customForm.register("migrateToScriptVersionId")}>
            <option value="">Migrate lead to another script version</option>
            {scriptVersions.map((version) => (
              <option key={version.id} value={version.id}>
                {version.name}
              </option>
            ))}
          </Select>
          <p className="text-xs text-[var(--muted)]">
            For a reusable new branch, create a cloned script version from the
            Scripts page and optionally migrate this lead to it here.
          </p>
          <div className="flex gap-2">
            <Button type="submit" size="sm">
              Save custom outcome
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowCustom(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
