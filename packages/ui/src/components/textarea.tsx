import type { TextareaHTMLAttributes } from "react";

import { cn } from "../lib/cn";

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-32 w-full rounded-xl border border-[#1E1F48]/20 bg-white px-4 py-3 text-sm text-[#1E1F48] shadow-sm outline-none transition focus:border-[#2E5ACF] focus:ring-2 focus:ring-[#2E5ACF]/20",
        className,
      )}
      {...props}
    />
  );
}
