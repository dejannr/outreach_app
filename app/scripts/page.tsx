import Link from "next/link";

import { PageHeader } from "@/components/page-header";
import { ScriptVersionActions } from "@/components/script-version-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ScriptsPage() {
  const scripts = await prisma.script.findMany({
    include: {
      versions: {
        include: {
          steps: true,
        },
        orderBy: {
          version: "desc",
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scripts"
        description="Manage versioned outreach scripts without breaking in-flight leads or historical metrics."
        actions={
          <Button asChild>
            <Link href="/scripts/new">Create script</Link>
          </Button>
        }
      />
      {scripts.length ? (
        <div className="space-y-4">
          {scripts.map((script) => {
            const activeVersion = script.versions.find((version) => version.isActive);
            return (
              <Card key={script.id} className="space-y-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{script.name}</h2>
                    <p className="text-sm text-[var(--muted)]">
                      {script.description || "No description"}
                    </p>
                  </div>
                  <Button asChild variant="secondary">
                    <Link href={`/scripts/${script.id}`}>View script</Link>
                  </Button>
                </div>
                <div className="grid gap-4 lg:grid-cols-5">
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Active version</p>
                    <p className="mt-2 text-xl font-bold">{activeVersion?.name || "None"}</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Number of steps</p>
                    <p className="mt-2 text-xl font-bold">{activeVersion?.steps.length || 0}</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Created</p>
                    <p className="mt-2 text-xl font-bold">{script.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Updated</p>
                    <p className="mt-2 text-xl font-bold">{script.updatedAt.toLocaleDateString()}</p>
                  </div>
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm text-[var(--muted)]">Is active</p>
                    <p className="mt-2 text-xl font-bold">{activeVersion?.isActive ? "Yes" : "No"}</p>
                  </div>
                </div>
                {activeVersion ? (
                  <ScriptVersionActions versionId={activeVersion.id} isActive={activeVersion.isActive} />
                ) : null}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No scripts yet" description="No scripts yet. Create a script or run the seed command." action={<Button asChild><Link href="/scripts/new">Create script</Link></Button>} />
      )}
    </div>
  );
}
