import { Building2, Globe, Home, MapPin, Navigation, Route, type LucideIcon } from "lucide-react";
import { createElement } from "react";

import { cn } from "@/lib/utils";

import type { SearchResult, SearchResultType } from "../types";

const TYPE_ICONS: Partial<Record<SearchResultType, LucideIcon>> = {
  city: Building2,
  town: Building2,
  village: Home,
  hamlet: Home,
  suburb: Home,
  neighbourhood: Home,
  road: Route,
  pedestrian: Navigation,
  path: Navigation,
  country: Globe,
};

function getIcon(type: SearchResultType): LucideIcon {
  return TYPE_ICONS[type] ?? MapPin;
}

interface SearchResultItemProps {
  result: SearchResult;
  isActive: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export function SearchResultItem({
  result,
  isActive,
  onSelect,
  onMouseEnter,
}: SearchResultItemProps) {
  const subtitle = [result.locality, result.department, result.region, result.country]
    .filter(Boolean)
    .join(", ");

  return (
    <li
      role="option"
      aria-selected={isActive}
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/40",
      )}
    >
      {createElement(getIcon(result.type), {
        className: "h-4 w-4 shrink-0 text-muted-foreground/60",
        "aria-hidden": true,
      })}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm leading-snug font-medium">{result.name}</p>
        {subtitle && (
          <p className="text-muted-foreground/60 truncate text-xs leading-snug">{subtitle}</p>
        )}
      </div>
    </li>
  );
}
