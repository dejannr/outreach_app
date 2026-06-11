import { Card } from "@/components/ui/card";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="border-dashed text-center">
      <div className="space-y-2 py-6">
        <h3 className="text-base font-semibold text-[var(--ink)]">{title}</h3>
        <p className="mx-auto max-w-xl text-sm leading-6 text-[var(--muted)]">
          {description}
        </p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </Card>
  );
}
