import { notFound } from "next/navigation";

import { OutcomeForm } from "@/components/forms/outcome-form";
import { StepForm } from "@/components/forms/step-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StepDetailPage({
  params,
}: {
  params: Promise<{ id: string; stepId: string }>;
}) {
  const { id, stepId } = await params;

  const script = await prisma.script.findUnique({
    where: { id },
  });
  const step = await prisma.scriptStep.findUnique({
    where: { id: stepId },
    include: {
      scriptVersion: true,
      outcomesFrom: {
        where: { isArchived: false },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!script || !step) {
    notFound();
  }

  const steps = await prisma.scriptStep.findMany({
    where: {
      scriptVersionId: step.scriptVersionId,
      isArchived: false,
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={step.name}
        description="Edit the step definition and manage every possible outcome branch."
      />

      <Card>
        <StepForm
          scriptVersionId={step.scriptVersionId}
          stepId={step.id}
          defaults={{
            name: step.name,
            key: step.key,
            metricKey: step.metricKey,
            channel: step.channel,
            subject: step.subject,
            scriptText: step.scriptText,
            instructions: step.instructions,
            defaultDelayDays: step.defaultDelayDays,
            sortOrder: step.sortOrder,
            isStartStep: step.isStartStep,
            isTerminalStep: step.isTerminalStep,
          }}
        />
      </Card>

      <Card className="space-y-4">
        <h2 className="text-xl font-bold">Outcomes</h2>
        <OutcomeForm stepId={step.id} steps={steps} />
        {step.outcomesFrom.map((outcome) => (
          <OutcomeForm
            key={outcome.id}
            stepId={step.id}
            steps={steps}
            outcomeId={outcome.id}
            defaults={{
              label: outcome.label,
              key: outcome.key,
              metricKey: outcome.metricKey,
              description: outcome.description,
              nextStepId: outcome.nextStepId,
              delayDays: outcome.delayDays,
              setLeadStatus: outcome.setLeadStatus,
              isTerminal: outcome.isTerminal,
              requiresNote: outcome.requiresNote,
              requiresDateTime: outcome.requiresDateTime,
              requiresContact: outcome.requiresContact,
              sortOrder: outcome.sortOrder,
            }}
          />
        ))}
      </Card>
    </div>
  );
}
