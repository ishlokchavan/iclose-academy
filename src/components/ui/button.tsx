import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils/cn";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
    "transition-all duration-200 ease-apple",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-40",
    "active:scale-[0.97]",
    "[&_svg]:size-4 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        /* Apple blue pill — the primary action */
        primary:
          "rounded-full bg-accent text-white hover:bg-accent-hover shadow-[0_1px_3px_rgba(0,112,227,0.3)] hover:shadow-[0_2px_8px_rgba(0,112,227,0.35)]",
        /* Frosted secondary */
        secondary:
          "rounded-full bg-surface-raised text-ink border border-hairline hover:bg-surface-subtle shadow-card",
        /* Ghost — no bg, no border */
        ghost:
          "rounded-lg text-ink hover:bg-surface-subtle",
        /* Text link */
        link:
          "rounded-sm text-accent underline-offset-4 hover:underline",
        /* Destructive */
        destructive:
          "rounded-full bg-destructive text-white hover:bg-destructive/90 shadow-[0_1px_3px_rgba(220,38,38,0.25)]",
      },
      size: {
        sm:   "h-8  px-4   text-[13px]",
        md:   "h-10 px-5   text-[15px]",
        lg:   "h-12 px-7   text-[17px]",
        icon: "h-10 w-10  rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
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
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
