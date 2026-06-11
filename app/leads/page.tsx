import Link from "next/link";
import { LeadStatus } from "@prisma/client";

import { EmptyState } from "@/components/empty-state";
import { QuickLeadForm } from "@/components/forms/quick-lead-form";
import { LeadTable } from "@/components/lead-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { prisma } from "@/lib/prisma";
import { getTodayWindow } from "@/lib/dates";

export const dynamic = "force-dynamic";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) || {};
  const query = typeof params.q === "string" ? params.q : "";
  const status = typeof params.status === "string" ? params.status : "";
  const due = typeof params.due === "string" ? params.due : "";
  const { start, end } = getTodayWindow();

  const leads = await prisma.lead.findMany({
    where: {
      status: status ? (status as LeadStatus) : undefined,
      nextTaskAt:
        due === "today"
          ? { gte: start, lte: end }
          : due === "overdue"
            ? { lt: start }
            : undefined,
      OR: query
        ? [
            { companyName: { contains: query, mode: "insensitive" } },
            { contactName: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
          ]
        : undefined,
    },
    include: {
      currentStep: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Find a lead, check its current status, and open the record when you need more context."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href="/leads/import">Import CSV</Link>
            </Button>
            <Button asChild>
              <Link href="/leads/new">New Lead</Link>
            </Button>
          </>
        }
      />

      <Card className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-[var(--ink)]">
            Quick Add Lead
          </h2>
          <p className="text-sm text-[var(--muted)]">
            Add a lead without leaving the page.
          </p>
        </div>
        <QuickLeadForm />
      </Card>

      <form className="grid gap-3 rounded-xl border bg-white p-4 md:grid-cols-4">
        <Input name="q" placeholder="Search company, contact, email, or phone" defaultValue={query} className="md:col-span-2" />
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {Object.values(LeadStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select name="due" defaultValue={due}>
          <option value="">Any due state</option>
          <option value="today">Due today</option>
          <option value="overdue">Overdue</option>
        </Select>
        <div className="md:col-span-4 flex flex-wrap gap-3">
          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      {leads.length ? (
        <LeadTable
          leads={leads.map((lead) => ({
            id: lead.id,
            companyName: lead.companyName,
            contactName: lead.contactName,
            status: lead.status,
            nextTaskAt: lead.nextTaskAt,
            lastContactedAt: lead.lastContactedAt,
            currentStepName: lead.currentStep?.name,
          }))}
        />
      ) : (
        <EmptyState title="No leads found" description="No leads match these filters. Add your first carrier lead to start outreach." action={<Button asChild><Link href="/leads/new">Create lead</Link></Button>} />
      )}
    </div>
  );
}
