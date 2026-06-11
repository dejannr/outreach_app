import { LeadForm } from "@/components/forms/lead-form";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="New Lead"
        description="Add a carrier lead with enough context to start the outreach script when ready."
      />
      <Card>
        <LeadForm />
      </Card>
    </div>
  );
}
