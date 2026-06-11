import Link from "next/link";
import { LeadStatus } from "@prisma/client";

import { EmptyState } from "@/components/empty-state";
import { LeadTable } from "@/components/lead-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
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
  const scriptVersionId =
    typeof params.scriptVersion === "string" ? params.scriptVersion : "";
  const dueToday = params.dueToday === "true";
  const overdue = params.overdue === "true";
  const noNextTask = params.noNextTask === "true";
  const { start, end } = getTodayWindow();

  const leads = await prisma.lead.findMany({
    where: {
      status: status ? (status as LeadStatus) : undefined,
      scriptVersionId: scriptVersionId || undefined,
      nextTaskAt: noNextTask
        ? null
        : dueToday
          ? { gte: start, lte: end }
          : overdue
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

  const scriptVersions = await prisma.scriptVersion.findMany({
    orderBy: [{ updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Search, filter, start outreach, and inspect every lead with its current step and next due date."
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

      <form className="grid gap-3 rounded-[2rem] border bg-white/75 p-5 md:grid-cols-6">
        <Input name="q" placeholder="Search company/contact/email/phone" defaultValue={query} className="md:col-span-2" />
        <Select name="status" defaultValue={status}>
          <option value="">All statuses</option>
          {Object.values(LeadStatus).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <Select name="scriptVersion" defaultValue={scriptVersionId}>
          <option value="">All scripts</option>
          {scriptVersions.map((version) => (
            <option key={version.id} value={version.id}>
              {version.name}
            </option>
          ))}
        </Select>
        <Select name="dueToday" defaultValue={String(dueToday)}>
          <option value="false">Any due date</option>
          <option value="true">Due today</option>
        </Select>
        <Select name="overdue" defaultValue={String(overdue)}>
          <option value="false">Not filtered by overdue</option>
          <option value="true">Overdue only</option>
        </Select>
        <div className="md:col-span-6 flex flex-wrap gap-3">
          <label className="flex items-center gap-2 rounded-full border px-3 py-2 text-sm">
            <input type="checkbox" name="noNextTask" value="true" defaultChecked={noNextTask} />
            No next task
          </label>
          <Button type="submit">Apply filters</Button>
        </div>
      </form>

      {leads.length ? (
        <LeadTable
          leads={leads.map((lead) => ({
            ...lead,
            currentStepName: lead.currentStep?.name,
          }))}
        />
      ) : (
        <EmptyState title="No leads found" description="No leads match these filters. Add your first carrier lead to start outreach." action={<Button asChild><Link href="/leads/new">Create lead</Link></Button>} />
      )}
    </div>
  );
}
