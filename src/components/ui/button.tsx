import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors duration-150 ease-linear disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 focus-solid",
  {
    variants: {
      variant: {
        // Primary button: solid fill, bottom border for depth, hard-edged drop
        default: "bg-primary text-primary-foreground border border-[hsl(var(--primary-700))] shadow-none hover:bg-[hsl(var(--primary-650))] active:translate-y-[2px] elev-drop-2 active:elev-inset-1 disabled:bg-[hsl(var(--primary-200))] disabled:text-[hsl(var(--foreground))]/40 disabled:border-[hsl(var(--surface-100))]",
        destructive: "bg-destructive text-destructive-foreground border border-[hsl(var(--destructive-600))] hover:bg-[hsl(var(--destructive-600))] shadow-none active:translate-y-[2px] elev-drop-2 active:elev-inset-1 disabled:bg-[hsl(var(--surface-100))] disabled:text-[hsl(var(--surface-700))] disabled:border-[hsl(var(--surface-600))] disabled:opacity-70",
        outline: "bg-background text-foreground border border-[hsl(var(--surface-700))] elev-drop-1 hover:border-[hsl(var(--surface-800))] active:translate-y-[2px] active:elev-inset-1",
        secondary: "bg-secondary text-secondary-foreground border border-[hsl(var(--surface-700))] elev-drop-1 hover:border-[hsl(var(--surface-800))] active:translate-y-[2px] active:elev-inset-1",
        ghost: "bg-background text-foreground border border-[hsl(var(--surface-700))] elev-drop-1 hover:border-[hsl(var(--surface-800))] active:translate-y-[2px] active:elev-inset-1",
        link: "text-primary underline-offset-4 hover:underline shadow-none border-0",
        success: "bg-success text-success-foreground border border-[hsl(var(--success-600))] hover:bg-[hsl(var(--success-600))] elev-drop-2 active:translate-y-[2px] active:elev-inset-1 disabled:bg-[hsl(var(--surface-100))] disabled:text-[hsl(var(--surface-700))] disabled:border-[hsl(var(--surface-600))] disabled:opacity-70",
        warning: "bg-warning text-warning-foreground border border-[hsl(var(--warning-600))] hover:bg-[hsl(var(--warning-600))] elev-drop-2 active:translate-y-[2px] active:elev-inset-1 disabled:bg-[hsl(var(--surface-100))] disabled:text-[hsl(var(--surface-700))] disabled:border-[hsl(var(--surface-600))] disabled:opacity-70",
        "status-active": "bg-status-active text-white border-2 border-transparent elev-drop-1 data-[active=true]:outline data-[active=true]:outline-2 data-[active=true]:outline-[hsl(var(--status-active))]",
        "status-inactive": "bg-status-inactive text-white border-2 border-transparent elev-drop-1 data-[active=true]:outline data-[active=true]:outline-2 data-[active=true]:outline-[hsl(var(--status-inactive))]",
        "status-transition": "bg-status-transition text-warning-foreground border-2 border-transparent elev-drop-1 data-[active=true]:outline data-[active=true]:outline-2 data-[active=true]:outline-[hsl(var(--status-transition))]",
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
