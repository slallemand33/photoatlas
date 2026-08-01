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
        "border-border/30 bg-background/35 overflow-hidden rounded-xl border shadow-sm",
        className,
      )}
    >
      <header className="border-border/20 flex items-center justify-between gap-3 border-b px-3.5 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="bg-primary/8 text-primary grid h-7 w-7 shrink-0 place-items-center rounded-lg">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
          <h3 className="text-foreground/85 truncate text-xs font-semibold tracking-[0.08em] uppercase">
            {title}
          </h3>
        </div>
        {status && (
          <span className="border-border/30 bg-muted/40 text-muted-foreground/70 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium">
            {status}
          </span>
        )}
      </header>
      <div className="p-3.5">{children}</div>
    </section>
  );
}
