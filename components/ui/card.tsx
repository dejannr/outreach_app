import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card-shadow rounded-3xl border bg-[var(--card)] p-5",
        className,
      )}
      {...props}
    />
  );
}
