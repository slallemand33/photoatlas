"use client";

import { ExternalLink, LoaderCircle, MapPin, RefreshCw, Video, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useWebcamDetail } from "../hooks";
import { useWebcamStore } from "../store";
import type { WebcamReferenceLocation } from "../types";
import { formatWebcamDistance } from "../utils";

import { WebcamImage } from "./WebcamImage";
import { WindyCourtesy } from "./WindyCourtesy";

interface WebcamDetailDialogProps {
  location: WebcamReferenceLocation;
}

function formatUpdate(value: string | null): string {
  if (!value) return "Mise à jour inconnue";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WebcamDetailDialog({ location }: WebcamDetailDialogProps) {
  const selectedWebcamId = useWebcamStore((state) => state.selectedWebcamId);
  const closeWebcam = useWebcamStore((state) => state.closeWebcam);
  const detail = useWebcamDetail(selectedWebcamId, location);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!selectedWebcamId) return;
    const previousOverflow = document.body.style.overflow;
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeWebcam();
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
      previousFocusRef.current?.focus();
    };
  }, [closeWebcam, selectedWebcamId]);

  if (!selectedWebcamId) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 sm:p-6">
      <button
        type="button"
        className="bg-overlay absolute inset-0 backdrop-blur-sm"
        onClick={closeWebcam}
        aria-label="Fermer le détail de la webcam"
      />
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="webcam-detail-title"
        className="border-border bg-card relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border shadow-2xl"
      >
        <header className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-info text-xs font-black tracking-[0.14em] uppercase">Terrain réel</p>
            <h2 id="webcam-detail-title" className="truncate text-xl font-black">
              {detail.data?.title ?? "Détail de la webcam"}
            </h2>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeWebcam}
            className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-6">
          {detail.isLoading ? (
            <div className="text-muted-foreground flex min-h-72 items-center justify-center gap-2">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              Chargement de la dernière image…
            </div>
          ) : detail.isError || !detail.data ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <p className="text-foreground font-bold">Cette webcam ne répond pas actuellement.</p>
              <p className="text-muted-foreground mt-2 max-w-sm text-sm">
                Son aperçu a peut-être expiré ou le fournisseur est temporairement indisponible.
              </p>
              <button
                type="button"
                onClick={() => void detail.refetch()}
                className="border-border bg-muted hover:bg-accent mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold"
              >
                <RefreshCw className="h-4 w-4" aria-hidden="true" /> Réessayer
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <WebcamImage
                src={detail.data.imageUrl ?? detail.data.thumbnailUrl}
                alt={`Dernière image de la webcam ${detail.data.title}`}
                sourceUrl={detail.data.sourceUrl}
                onExpired={() => void detail.refetch()}
                className="block aspect-video w-full overflow-hidden rounded-2xl"
              />

              <div className="border-border bg-muted/25 grid gap-3 rounded-2xl border p-4 text-sm sm:grid-cols-2">
                <p className="text-muted-foreground flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  {formatWebcamDistance(detail.data.distanceKm)} du lieu
                </p>
                <p className="text-muted-foreground sm:text-right">
                  {formatUpdate(detail.data.lastUpdatedAt)}
                </p>
                {(detail.data.location.city || detail.data.location.country) && (
                  <p className="text-foreground font-semibold sm:col-span-2">
                    {[
                      detail.data.location.city,
                      detail.data.location.region,
                      detail.data.location.country,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={detail.data.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-primary-foreground inline-flex min-h-11 items-center gap-2 rounded-xl px-5 text-sm font-bold"
                >
                  Ouvrir sur Windy <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
                {detail.data.playerUrl && (
                  <a
                    href={detail.data.playerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-border bg-muted hover:bg-accent inline-flex min-h-11 items-center gap-2 rounded-xl border px-5 text-sm font-bold"
                  >
                    <Video className="h-4 w-4" aria-hidden="true" /> Voir le timelapse
                  </a>
                )}
              </div>

              <WindyCourtesy />
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body,
  );
}
