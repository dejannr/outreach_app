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
    <Card className="grain border-dashed text-center">
      <div className="space-y-3 py-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="mx-auto max-w-xl text-sm text-[var(--muted)]">
          {description}
        </p>
        {action ? <div className="pt-2">{action}</div> : null}
      </div>
    </Card>
  );
}
