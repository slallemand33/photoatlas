import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PlaceDashboardSectionProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  status?: string;
  className?: string;
}

export function PlaceDashboardSection({
  title,
  icon: Icon,
  children,
  status,
  className,
}: PlaceDashboardSectionProps) {
  return (
    <section
      className={cn(
        "border-border bg-card overflow-hidden rounded-2xl border shadow-sm",
        className,
      )}
    >
      <header className="border-border flex items-center justify-between gap-3 border-b px-4 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="bg-primary/10 text-primary grid h-10 w-10 shrink-0 place-items-center rounded-xl">
            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <h3 className="text-foreground truncate text-base font-bold tracking-tight sm:text-lg">{title}</h3>
        </div>
        {status && (
          <span className="border-border bg-muted text-muted-foreground shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold sm:text-sm">
            {status}
          </span>
        )}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
