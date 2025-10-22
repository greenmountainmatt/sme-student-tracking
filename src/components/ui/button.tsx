import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-150 ease-linear disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-solid",
  {
    variants: {
      variant: {
        // Primary: filled with consistent border; color-only state changes
        default: "bg-[hsl(var(--button-primary-fill-default))] hover:bg-[hsl(var(--button-primary-fill-hover))] active:bg-[hsl(var(--button-primary-fill-active))] text-primary-foreground border border-[hsl(var(--button-primary-border))] shadow-none disabled:bg-[hsl(var(--button-primary-fill-disabled))] disabled:text-[hsl(var(--foreground))]/40",
        destructive: "bg-destructive text-destructive-foreground border border-destructive shadow-none",
        // Secondary/Outline: outlined with surface fill; color-only on hover/active
        outline: "bg-[hsl(var(--button-secondary-fill-default))] text-foreground border border-[hsl(var(--button-secondary-border-default))] hover:border-[hsl(var(--button-secondary-border-hover))] active:bg-[hsl(var(--button-secondary-fill-active))]",
        secondary: "bg-[hsl(var(--button-secondary-fill-default))] text-secondary-foreground border border-[hsl(var(--button-secondary-border-default))] hover:border-[hsl(var(--button-secondary-border-hover))] active:bg-[hsl(var(--button-secondary-fill-active))]",
        ghost: "bg-background text-foreground border border-[hsl(var(--button-secondary-border-default))] hover:border-[hsl(var(--button-secondary-border-hover))] active:bg-[hsl(var(--button-secondary-fill-active))]",
        link: "text-primary underline-offset-4 hover:underline shadow-none border-0",
        success: "bg-success text-success-foreground border border-[hsl(var(--surface-700))]",
        warning: "bg-warning text-warning-foreground border border-[hsl(var(--surface-700))]",
        "status-active": "bg-status-active text-white border-2 border-[hsl(var(--surface-700))]",
        "status-inactive": "bg-status-inactive text-white border-2 border-[hsl(var(--surface-700))]",
        "status-transition": "bg-status-transition text-warning-foreground border-2 border-[hsl(var(--surface-700))]",
      },
      size: {
        default: "h-10 px-3 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-6",
        xl: "h-12 rounded-md px-8 text-base",
        icon: "h-10 w-10",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
