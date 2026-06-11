import { SettingsForm } from "@/components/forms/settings-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getAppSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getAppSettings();
  const versions = await prisma.scriptVersion.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage the active script version, daily new lead limit, sender defaults, timezone, and working days."
      />
      <Card>
        <SettingsForm settings={settings} versions={versions} />
      </Card>
    </div>
  );
}
