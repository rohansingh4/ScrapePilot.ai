import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]",
        primary:
          "border-[var(--primary)]/30 bg-[var(--primary)]/10 text-[var(--primary)]",
        secondary:
          "border-[var(--border)] bg-[var(--secondary)] text-[var(--secondary-foreground)]",
        success:
          "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
        warning:
          "border-[var(--warning)]/30 bg-[var(--warning)]/10 text-[var(--warning)]",
        error:
          "border-[var(--error)]/30 bg-[var(--error)]/10 text-[var(--error)]",
        outline: "border-[var(--border)] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
