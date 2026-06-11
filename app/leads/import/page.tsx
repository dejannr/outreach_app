import { LeadImportForm } from "@/components/forms/lead-import-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function LeadImportPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Lead Import"
        description="Paste CSV rows with the required headers, preview them, and import only valid non-duplicate leads."
      />
      <Card>
        <LeadImportForm />
      </Card>
    </div>
  );
}
