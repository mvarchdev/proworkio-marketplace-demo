import type { PropsWithChildren } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]",
  {
    variants: {
      variant: {
        accent: "bg-[#DDFE7F] text-[#1E1F48]",
        muted: "bg-[#EEF0FD] text-[#1E1F48]",
        dark: "bg-[#1E1F48] text-white",
      },
    },
    defaultVariants: {
      variant: "accent",
    },
  },
);

export function Badge({
  children,
  className,
  variant,
}: PropsWithChildren<VariantProps<typeof badgeVariants> & { className?: string }>) {
  return <span className={cn(badgeVariants({ variant, className }))}>{children}</span>;
}
