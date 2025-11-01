import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium transition-colors duration-150 ease-linear focus-solid",
  {
    variants: {
      variant: {
        // Selected chip/tag
        default: "bg-[hsl(var(--chip-selected-fill))] text-[hsl(var(--chip-selected-text))] border-[hsl(var(--chip-unselected-border))]",
        secondary: "border-[hsl(var(--surface-700))] bg-secondary text-secondary-foreground",
        destructive: "border-[color:transparent] bg-destructive text-destructive-foreground",
        // Unselected chip/tag
        outline: "text-foreground border-[hsl(var(--chip-unselected-border))] hover:border-[hsl(var(--surface-700))]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
