import type { LucideIcon } from "lucide-react";
import {
  Bookmark,
  Camera,
  ChevronLeft,
  ChevronRight,
  Cloud,
  Map,
  Settings2,
  Star,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { LayerPanel } from "@/features/layers/components";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const PRIMARY_NAV: NavItem[] = [
  { id: "map", label: "Carte", icon: Map },
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
  return (
    <button
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-md py-2.5 text-sm text-muted-foreground",
        "transition-colors hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        collapsed ? "lg:justify-center lg:px-2" : "px-3",
        // Sur mobile la sidebar est toujours expanded
        "px-3",
      )}
      aria-label={item.label}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      <span className={cn("truncate", collapsed && "lg:hidden")}>{item.label}</span>
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
  return (
    <aside
      id="app-sidebar"
      className={cn(
        // Base
        "flex flex-col overflow-hidden border-r border-border/40 bg-card",
        "transition-all duration-300 ease-in-out",
        // Mobile : overlay absolu dans le conteneur de contenu (sous le header)
        "absolute inset-y-0 left-0 z-40 w-72",
        mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full",
        // Desktop : élément inline du flex, largeur variable
        "lg:relative lg:inset-auto lg:z-auto lg:h-full lg:translate-x-0 lg:shadow-none",
        collapsed ? "lg:w-14" : "lg:w-60",
      )}
      aria-label="Navigation principale"
    >
      {/* Barre d'outils de la sidebar */}
      <div
        className={cn(
          "flex h-12 shrink-0 items-center justify-between border-b border-border/40 px-3",
          collapsed && "lg:justify-center",
        )}
      >
        <span
          className={cn(
            "text-xs font-medium uppercase tracking-wider text-muted-foreground/60",
            collapsed && "lg:hidden",
          )}
        >
          Navigation
        </span>

        <div className="flex items-center">
          {/* Bouton fermeture — mobile uniquement */}
          <button
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            onClick={onMobileClose}
            aria-label="Fermer la navigation"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>

          {/* Bouton collapse — desktop uniquement */}
          <button
            className="hidden h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
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
      <div
        className={cn(
          "flex-1 overflow-y-auto border-t border-border/20",
          collapsed && "lg:hidden",
        )}
      >
        <LayerPanel />
      </div>

      {/* Navigation secondaire */}
      <nav
        className="flex flex-col gap-0.5 border-t border-border/40 p-2"
        aria-label="Navigation secondaire"
      >
        {SECONDARY_NAV.map((item) => (
          <NavItemButton key={item.id} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
