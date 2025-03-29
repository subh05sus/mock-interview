import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        outlineSecondary:
          "border-secondary text-secondary-foreground hover:bg-secondary/50",
        outlineDestructive:
          "border-destructive text-destructive-foreground hover:bg-destructive/50",
        outlineDefault:
          "border-primary text-primary-foreground hover:bg-primary/50",
        outlineGhost: "border-accent text-accent-foreground hover:bg-accent/50",
        success:
          "border-transparent bg-success text-success-foreground shadow hover:bg-success/80",
        info: "border-transparent bg-info text-info-foreground shadow hover:bg-info/80",
        warning:
          "border-transparent bg-warning text-warning-foreground shadow hover:bg-warning/80",
        error:
          "border-transparent bg-error text-error-foreground shadow hover:bg-error/80",
        light:
          "border-transparent bg-light text-light-foreground shadow hover:bg-light/80",
        dark: "border-transparent bg-dark text-dark-foreground shadow hover:bg-dark/80",
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
