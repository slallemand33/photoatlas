import { Bookmark, MapPin, X } from "lucide-react";

import type { SearchResult } from "../types";
import { formatCoordinates } from "../utils/format";

interface SearchInfoPanelProps {
  result: SearchResult;
  onClose: () => void;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="text-muted-foreground/50 w-20 shrink-0">{label}</span>
      <span className="text-muted-foreground/80">{value}</span>
    </div>
  );
}

export function SearchInfoPanel({ result, onClose }: SearchInfoPanelProps) {
  return (
    <div
      className="border-border/40 bg-card absolute top-full right-0 left-0 z-50 mt-1 overflow-hidden rounded-lg border shadow-xl"
      role="region"
      aria-label={`Informations sur ${result.name}`}
    >
      {/* En-tête */}
      <div className="border-border/20 flex items-start justify-between gap-2 border-b px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="text-primary h-4 w-4 shrink-0" aria-hidden="true" />
          <h3 className="truncate text-sm font-semibold">{result.name}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground/40 hover:text-muted-foreground shrink-0 rounded p-0.5 transition-colors"
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
      <div className="border-border/20 border-t px-3 pt-2 pb-2.5">
        <button
          disabled
          className="border-border text-muted-foreground flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border py-2 text-sm font-semibold disabled:cursor-not-allowed"
          aria-label="Ajouter aux favoris (bientôt disponible)"
        >
          <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
          Ajouter aux favoris
        </button>
      </div>
    </div>
  );
}
