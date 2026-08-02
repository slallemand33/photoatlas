import Link from "next/link";

import { PROJECT_IDENTITY } from "@/lib/projectIdentity";

export function Footer() {
  return (
    <footer
      className="border-border bg-background/90 text-muted-foreground flex min-h-11 shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 border-t px-4 py-2 text-xs sm:text-sm"
      role="contentinfo"
    >
      <Link href="/pourquoi-photoatlas" className="text-foreground font-semibold hover:underline">
        {PROJECT_IDENTITY.name}
      </Link>
      <span className="bg-muted rounded-full px-2 py-0.5 font-semibold">
        Version {PROJECT_IDENTITY.version}
      </span>
      <span className="text-border hidden sm:inline" aria-hidden="true">
        •
      </span>
      <span>Développé par {PROJECT_IDENTITY.creator}</span>
      <span className="text-border hidden sm:inline" aria-hidden="true">
        •
      </span>
      <a
        href={PROJECT_IDENTITY.afficheParNatureUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:text-foreground underline-offset-4 transition-colors hover:underline"
      >
        Affiche par Nature
      </a>
    </footer>
  );
}
