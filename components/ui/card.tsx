import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "card-shadow rounded-xl border bg-[var(--surface)] p-5",
        className,
      )}
      {...props}
    />
  );
}
