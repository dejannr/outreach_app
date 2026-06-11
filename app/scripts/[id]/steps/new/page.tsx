import { notFound } from "next/navigation";

import { StepForm } from "@/components/forms/step-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewStepPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = (await searchParams) || {};
  const script = await prisma.script.findUnique({
    where: { id },
    include: {
      versions: {
        orderBy: { version: "desc" },
      },
    },
  });

  if (!script) {
    notFound();
  }

  const versionId =
    (typeof query.versionId === "string" ? query.versionId : "") ||
    script.versions.find((version) => version.isActive)?.id ||
    script.versions[0]?.id;

  if (!versionId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add Step"
        description="Create a new step on the selected script version."
      />
      <Card>
        <StepForm scriptVersionId={versionId} />
      </Card>
    </div>
  );
}
