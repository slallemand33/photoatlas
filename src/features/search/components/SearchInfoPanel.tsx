import { Bookmark, MapPin, X } from "lucide-react";

import type { SearchResult } from "../types";
import { formatCoordinates } from "../utils/format";

interface SearchInfoPanelProps {
  result: SearchResult;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      <span className="w-20 shrink-0 text-muted-foreground/50">{label}</span>
      <span className="text-muted-foreground/80">{value}</span>
    </div>
  );
}

export function SearchInfoPanel({ result, onClose }: SearchInfoPanelProps) {
  return (
    <div
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-border/40 bg-card shadow-xl"
      role="region"
      aria-label={`Informations sur ${result.name}`}
    >
      {/* En-tête */}
      <div className="flex items-start justify-between gap-2 border-b border-border/20 px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <h3 className="truncate text-sm font-semibold">{result.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="shrink-0 rounded p-0.5 text-muted-foreground/40 transition-colors hover:text-muted-foreground"
          aria-label="Fermer"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      {/* Détails */}
      <div className="flex flex-col gap-1.5 px-3 py-2.5">
        {result.locality && result.locality !== result.name && (
          <InfoRow label="Commune" value={result.locality} />
        )}
        {result.department && <InfoRow label="Département" value={result.department} />}
        {result.region && <InfoRow label="Région" value={result.region} />}
        {result.country && <InfoRow label="Pays" value={result.country} />}
        <InfoRow label="Coordonnées" value={formatCoordinates(result.latitude, result.longitude)} />
      </div>

      {/* Bouton favoris */}
      <div className="border-t border-border/20 px-3 pb-2.5 pt-2">
        <button
          disabled
          className="flex w-full items-center justify-center gap-1.5 rounded-md border border-border/30 py-1.5 text-xs text-muted-foreground/40 disabled:cursor-not-allowed"
          aria-label="Ajouter aux favoris (bientôt disponible)"
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          Ajouter aux favoris
        </button>
      </div>
    </div>
  );
}
