import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/page-header";
import { ScriptStepCard } from "@/components/script-step-card";
import { ScriptVersionActions } from "@/components/script-version-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScriptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const script = await prisma.script.findUnique({
    where: { id },
    include: {
      versions: {
        include: {
          steps: {
            where: { isArchived: false },
            include: {
              outcomesFrom: {
                where: { isArchived: false },
                include: {
                  nextStep: true,
                },
                orderBy: {
                  sortOrder: "asc",
                },
              },
            },
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
        orderBy: {
          version: "desc",
        },
      },
    },
  });

  if (!script) {
    notFound();
  }

  const activeVersion = script.versions.find((version) => version.isActive) || script.versions[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={script.name}
        description={script.description || "Versioned workflow definition."}
        actions={
          activeVersion ? (
            <>
              <Button asChild variant="secondary">
                <Link href={`/scripts/${script.id}/steps/new?versionId=${activeVersion.id}`}>Add step</Link>
              </Button>
              <ScriptVersionActions versionId={activeVersion.id} isActive={activeVersion.isActive} />
            </>
          ) : undefined
        }
      />

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Versions</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {script.versions.map((version) => (
            <div key={version.id} className="rounded-lg border bg-[var(--surface-subtle)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-[var(--ink)]">{version.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {version.steps.length} step(s)
                  </p>
                </div>
                {version.isActive ? (
                  <span className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                    Active
                  </span>
                ) : null}
              </div>
              <div className="mt-4">
                <ScriptVersionActions versionId={version.id} isActive={version.isActive} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {activeVersion ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-[var(--ink)]">
            Steps for {activeVersion.name}
          </h2>
          {activeVersion.steps.map((step) => (
            <ScriptStepCard key={step.id} scriptId={script.id} step={step} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
