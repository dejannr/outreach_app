import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-[2rem] border bg-white/75 p-6 backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          TruckA Outreach
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
        {description ? (
          <p className="max-w-3xl text-sm text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
