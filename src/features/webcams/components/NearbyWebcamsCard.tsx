"use client";

import { Camera, ChevronRight, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect } from "react";

import { PlaceDashboardSection } from "@/features/place-details/components/PlaceDashboardSection";
import type { SearchResult } from "@/features/search/types";

import { useNearbyWebcams } from "../hooks";
import { useWebcamStore } from "../store";
import { formatWebcamDistance } from "../utils";

import { WebcamDetailDialog } from "./WebcamDetailDialog";
import { WebcamImage } from "./WebcamImage";
import { WindyCourtesy } from "./WindyCourtesy";

export function NearbyWebcamsCard({ place }: { place: SearchResult }) {
  const webcams = useNearbyWebcams(place);
  const openWebcam = useWebcamStore((state) => state.openWebcam);
  const closeWebcam = useWebcamStore((state) => state.closeWebcam);
  const result = webcams.data;

  useEffect(() => () => closeWebcam(), [closeWebcam, place.id]);

  return (
    <>
      <PlaceDashboardSection
        title="Webcams proches"
        icon={Camera}
        status={
          webcams.isFetching
            ? "Actualisation…"
            : result
              ? `${result.webcams.length} trouvée${result.webcams.length > 1 ? "s" : ""}`
              : undefined
        }
        className="border-info/25 from-info/10 via-card to-card bg-gradient-to-br"
      >
        {webcams.isLoading ? (
          <div className="text-muted-foreground flex min-h-36 items-center justify-center gap-2 text-sm">
            <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
            Recherche des webcams autour de {place.name}…
          </div>
        ) : webcams.isError ? (
          <div className="py-5 text-center">
            <p className="text-foreground text-sm font-bold">Webcams indisponibles</p>
            <p className="text-muted-foreground mx-auto mt-2 max-w-sm text-xs leading-relaxed">
              {webcams.error.message}
            </p>
            <button
              type="button"
              onClick={() => void webcams.refetch()}
              className="border-border bg-muted hover:bg-accent mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Réessayer
            </button>
          </div>
        ) : !result || result.webcams.length === 0 ? (
          <div className="py-6 text-center">
            <span className="bg-muted text-muted-foreground mx-auto grid h-12 w-12 place-items-center rounded-2xl">
              <Camera className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="text-foreground mt-4 text-sm font-bold">Aucune webcam à proximité</p>
            <p className="text-muted-foreground mt-1 text-xs">
              Aucune caméra publique n’a été trouvée dans un rayon de {result?.radiusKm ?? 50} km.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <ul className="grid gap-3" aria-label={`Webcams proches de ${place.name}`}>
              {result.webcams.slice(0, 5).map((webcam) => (
                <li key={webcam.id}>
                  <article className="border-border bg-background/40 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-3 overflow-hidden rounded-xl border p-2.5">
                    <WebcamImage
                      src={webcam.thumbnailUrl ?? webcam.imageUrl}
                      alt={`Aperçu de la webcam ${webcam.title}`}
                      sourceUrl={webcam.sourceUrl}
                      onExpired={() => void webcams.refetch()}
                      className="block aspect-[4/3] w-full overflow-hidden rounded-lg"
                    />
                    <div className="flex min-w-0 flex-col">
                      <h4 className="text-foreground line-clamp-2 text-sm leading-snug font-bold">
                        {webcam.title}
                      </h4>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatWebcamDistance(webcam.distanceKm)} · {webcam.source}
                      </p>
                      <button
                        type="button"
                        onClick={() => openWebcam(webcam.id)}
                        className="text-primary hover:bg-primary/10 mt-auto inline-flex min-h-11 items-center justify-end gap-1 self-end rounded-lg px-2 text-xs font-black transition-colors"
                        aria-label={`Voir la webcam ${webcam.title}`}
                      >
                        Voir <ChevronRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </article>
                </li>
              ))}
            </ul>

            <WindyCourtesy />
          </div>
        )}
      </PlaceDashboardSection>

      <WebcamDetailDialog location={place} />
    </>
  );
}
