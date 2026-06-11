import { ScriptForm } from "@/components/forms/script-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewScriptPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="New Script" description="Create a new top-level script. A first version will be generated automatically." />
      <Card>
        <ScriptForm />
      </Card>
    </div>
  );
}
