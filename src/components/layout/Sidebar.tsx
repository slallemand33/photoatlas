"use client";

import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Map,
  CircleHelp,
  Settings2,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LayerPanel } from "@/features/layers/components";
import { cn } from "@/lib/utils";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
}

const PRIMARY_NAV: NavItem[] = [
  { id: "map", label: "Carte", icon: Map, href: "/" },
  { id: "why", label: "Pourquoi PhotoAtlas ?", icon: CircleHelp, href: "/pourquoi-photoatlas" },
  { id: "weather", label: "Conditions météo", icon: Cloud },
  { id: "astronomy", label: "Astronomie", icon: Star },
  { id: "spots", label: "Spots photo", icon: Camera },
  { id: "favorites", label: "Favoris", icon: Bookmark },
];

const SECONDARY_NAV: NavItem[] = [{ id: "settings", label: "Paramètres", icon: Settings2 }];

interface NavItemButtonProps {
  item: NavItem;
  collapsed: boolean;
}

function NavItemButton({ item, collapsed }: NavItemButtonProps) {
  const Icon = item.icon;
  const pathname = usePathname();
  const active = item.href ? pathname === item.href : false;
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
  return item.href ? (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={className}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
    >
      {content}
    </Link>
  ) : (
    <button
      title={collapsed ? item.label : undefined}
      className={className}
      aria-label={item.label}
    >
      {content}
    </button>
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
      {/* Barre d'outils de la sidebar */}
      <div
        className={cn(
          "border-border flex h-14 shrink-0 items-center justify-between border-b px-4",
          collapsed && "lg:justify-center",
        )}
      >
        <span
          className={cn(
            "text-muted-foreground text-sm font-bold tracking-[0.12em] uppercase",
            collapsed && "lg:hidden",
          )}
        >
          Navigation
        </span>

        <div className="flex items-center">
          {/* Bouton fermeture — mobile uniquement */}
          <button
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-11 w-11 items-center justify-center rounded-xl transition-colors lg:hidden"
            onClick={onMobileClose}
            aria-label="Fermer la navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Bouton collapse — desktop uniquement */}
          <button
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground hidden h-11 w-11 items-center justify-center rounded-xl transition-colors lg:flex"
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
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="flex flex-col gap-0.5 p-2" aria-label="Navigation principale">
        {PRIMARY_NAV.map((item) => (
          <NavItemButton key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Panneau des couches — masqué sur desktop replié */}
      {pathname === "/" ? (
        <div
          className={cn(
            "border-border/20 flex-1 overflow-y-auto border-t",
            collapsed && "lg:hidden",
          )}
        >
          <LayerPanel />
        </div>
      ) : (
        <div className="flex-1" />
      )}

      {/* Navigation secondaire */}
      <nav
        className="border-border/40 flex flex-col gap-0.5 border-t p-2"
        aria-label="Navigation secondaire"
      >
        {SECONDARY_NAV.map((item) => (
          <NavItemButton key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
