import type { HTMLAttributes } from "react";

import { cn } from "../lib/cn";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[1.25rem] border border-white/60 bg-white/90 p-6 shadow-[0_18px_60px_-32px_rgba(30,31,72,0.28)] backdrop-blur-sm",
        className,
      )}
      {...props}
    />
  );
}
