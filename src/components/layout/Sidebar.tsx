"use client";

import type { LucideIcon } from "lucide-react";
import { ChevronLeft, ChevronRight, CircleHelp, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayerPanel } from "@/features/layers/components";
import { PhotoGuidesPanel } from "@/features/photo-guides";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const ABOUT_NAV: NavItem = {
  label: "Pourquoi PhotoAtlas ?",
  icon: CircleHelp,
  href: "/pourquoi-photoatlas",
};

interface NavItemButtonProps {
  item: NavItem;
  collapsed: boolean;
}

function NavItemButton({ item, collapsed }: NavItemButtonProps) {
  const Icon = item.icon;
  const pathname = usePathname();
  const active = pathname === item.href;
  const className = cn(
    "flex min-h-11 w-full items-center gap-3 rounded-xl py-3 text-base font-medium",
    active
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
    "transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    collapsed ? "lg:justify-center lg:px-2" : "px-3",
    "px-3",
  );
  const content = (
    <>
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
    </>
  );
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={className}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onCollapsedToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ collapsed, onCollapsedToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="app-sidebar"
      className={cn(
        // Base
        "border-border/40 bg-card flex flex-col overflow-hidden border-r",
        "transition-all duration-300 ease-in-out",
        // Mobile : overlay absolu dans le conteneur de contenu (sous le header)
        "absolute inset-y-0 left-0 z-40 w-80",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop : élément inline du flex, largeur variable
        "lg:relative lg:inset-auto lg:z-auto lg:h-full lg:translate-x-0 lg:shadow-none",
        collapsed ? "lg:w-[4.5rem]" : "lg:w-72",
      )}
      aria-label="Navigation principale"
    >
      <div className="border-border flex shrink-0 items-center justify-end border-b px-4 py-2 lg:hidden">
        <button
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-11 w-11 items-center justify-center rounded-xl transition-colors"
          onClick={onMobileClose}
          aria-label="Fermer la navigation"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <button
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground absolute top-3 right-3 z-10 hidden h-11 w-11 items-center justify-center rounded-xl transition-colors lg:flex"
        onClick={onCollapsedToggle}
        aria-label={collapsed ? "Développer la barre latérale" : "Réduire la barre latérale"}
        aria-expanded={!collapsed}
        aria-controls="app-sidebar"
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            "border-border/30 border-b px-4 pt-4 pb-4 lg:pr-16",
            collapsed && "lg:hidden",
          )}
        >
          <h2 className="text-foreground text-lg leading-tight font-bold tracking-tight">
            Trouvez où et quand faire votre prochaine photo.
          </h2>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
            Météo, lumière et astronomie pour préparer vos sorties photo.
          </p>
        </div>

        {pathname === "/map" ? (
          <>
            <section className={cn("border-border/20 border-b", collapsed && "lg:hidden")}>
              <PhotoGuidesPanel />
            </section>

            <section className={cn(collapsed && "lg:hidden")}>
              <div className="px-4 pt-3 pb-1.5">
                <span className="text-muted-foreground text-sm font-bold tracking-[0.12em] uppercase">
                  Conditions
                </span>
              </div>
              <LayerPanel />
            </section>
          </>
        ) : null}
      </div>

      <nav className="border-border/40 flex flex-col gap-0.5 border-t p-2" aria-label="Navigation secondaire">
        <NavItemButton item={ABOUT_NAV} collapsed={collapsed} />
      </nav>
    </aside>
  );
}
