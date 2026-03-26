import Link from "next/link";

import { Badge, Button } from "@proworkio/ui";

import type { ResourceAction } from "@/lib/admin-data";

interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  action: ResourceAction;
  badge?: string;
}

export function PageHeader({ eyebrow, title, description, action, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[#2E5ACF]">
            {eyebrow}
          </p>
          {badge ? <Badge variant="muted">{badge}</Badge> : null}
        </div>
        <h2 className="text-3xl font-semibold tracking-tight text-[#0f172a] sm:text-4xl">
          {title}
        </h2>
        <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>

      <Button asChild variant={action.variant ?? "primary"} className="w-full lg:w-auto">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  );
}
