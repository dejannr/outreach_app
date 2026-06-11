import { formatDistanceToNow } from "date-fns";

import { Card } from "@/components/ui/card";

type TimelineItem = {
  id: string;
  title: string;
  body?: string | null;
  createdAt: Date;
  kind: "activity" | "note";
};

export function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--ink)]">Timeline</h2>
        <p className="text-sm text-[var(--muted)]">
          Human-readable activity history and notes.
        </p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative pl-5">
            <span className="absolute left-0 top-2 h-2 w-2 rounded-full bg-[var(--line-strong)]" />
            <div className="rounded-lg border bg-white p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-[var(--ink)]">{item.title}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--muted)]">
                  {item.kind === "note" ? "Note" : "Activity"} ·{" "}
                  {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </p>
              </div>
              {item.body ? (
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[var(--muted)]">
                  {item.body}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
