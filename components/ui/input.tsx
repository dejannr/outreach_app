import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-[var(--line-strong)] bg-white px-3 py-2 text-sm text-[var(--ink)] outline-none transition shadow-none placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:ring-3 focus:ring-[color:rgba(37,99,235,0.12)]",
          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
