"use client";

import { MapPin, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

interface GuideLocationNoticeProps {
  onClose: () => void;
}

const AUTO_DISMISS_MS = 6500;

export function GuideLocationNotice({ onClose }: GuideLocationNoticeProps) {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timeout);
  }, [onClose]);

  return createPortal(
    <aside
      role="status"
      aria-live="polite"
      className="animate-in slide-in-from-bottom-4 fade-in border-info/35 bg-card fixed right-4 bottom-4 left-4 z-[100] mx-auto max-w-md overflow-hidden rounded-2xl border shadow-2xl duration-300 sm:right-6 sm:bottom-6 sm:left-auto sm:mx-0"
    >
      <div className="bg-info h-1" aria-hidden="true" />
      <div className="p-5">
        <div className="flex items-start gap-4">
          <span className="bg-info/10 text-info grid h-11 w-11 shrink-0 place-items-center rounded-xl">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-foreground text-lg font-black">📍 Sélectionnez un lieu</h3>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Les guides Soleil, Lune et Voie Lactée sont calculés à partir d&apos;un lieu précis.
            </p>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              Recherchez une ville ou cliquez sur la carte pour commencer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:bg-accent hover:text-foreground grid h-11 w-11 shrink-0 place-items-center rounded-xl transition-colors"
            aria-label="Fermer la notification"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="bg-primary text-primary-foreground hover:bg-primary/85 min-h-11 rounded-xl px-5 text-sm font-bold transition-colors"
          >
            Compris
          </button>
        </div>
      </div>
    </aside>,
    document.body,
  );
}
