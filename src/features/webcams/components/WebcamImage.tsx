"use client";

import { CameraOff } from "lucide-react";
import { useState } from "react";

interface WebcamImageProps {
  src: string | null;
  alt: string;
  sourceUrl: string;
  className?: string;
  onExpired?: () => void;
}

export function WebcamImage({ src, alt, sourceUrl, className, onExpired }: WebcamImageProps) {
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const unavailable = !src || failedSource === src;

  if (unavailable) {
    return (
      <div className={`bg-muted text-muted-foreground grid place-items-center ${className ?? ""}`}>
        <CameraOff className="h-6 w-6" aria-hidden="true" />
        <span className="sr-only">Aperçu indisponible</span>
      </div>
    );
  }

  return (
    <a
      href={sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`bg-black ${className ?? ""}`}
      aria-label={`Ouvrir ${alt} sur Windy`}
    >
      {/* Les domaines et jetons d’image Windy sont dynamiques : l’optimiseur Next ne convient pas. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain"
        onError={() => {
          setFailedSource(src);
          onExpired?.();
        }}
      />
    </a>
  );
}
