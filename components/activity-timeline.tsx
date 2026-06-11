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
        <h2 className="text-xl font-bold">Timeline</h2>
        <p className="text-sm text-[var(--muted)]">
          Human-readable activity history and notes.
        </p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative pl-6">
            <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)]" />
            <div className="rounded-2xl border bg-white p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="font-semibold">{item.title}</p>
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                  {item.kind === "note" ? "Note" : "Activity"} ·{" "}
                  {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </p>
              </div>
              {item.body ? (
                <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">
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
