"use client";

import { Aperture, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SearchBar } from "@/features/search/components";

import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  mobileSidebarOpen: boolean;
  showToolNavigation: boolean;
}

export function Header({ onMobileMenuToggle, mobileSidebarOpen, showToolNavigation }: HeaderProps) {
  const pathname = usePathname();
  const isAboutPage = pathname === "/pourquoi-photoatlas";

  return (
    <header
      className="border-border bg-background/95 relative z-10 flex min-h-16 shrink-0 flex-wrap items-center gap-3 border-b px-4 py-2 shadow-sm backdrop-blur-xl md:h-16 md:flex-nowrap md:py-0"
      role="banner"
    >
      {/* Hamburger — mobile uniquement */}
      {showToolNavigation ? (
        <button
          className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors lg:hidden"
          onClick={onMobileMenuToggle}
          aria-label={mobileSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={mobileSidebarOpen}
          aria-controls="app-sidebar"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      ) : null}

      {/* Logo */}
      <Link
        href="/"
        className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl px-2"
        aria-label="PhotoAtlas — Accueil"
      >
        <Aperture className="text-primary h-7 w-7" aria-hidden="true" />
        <span className="text-lg font-bold tracking-tight">PhotoAtlas</span>
      </Link>

      {/* Barre de recherche */}
      {showToolNavigation ? (
        <SearchBar />
      ) : (
        <div className="ml-auto hidden flex-1 md:block" aria-hidden="true" />
      )}

      <div className="ml-auto flex items-center gap-2">
        {!showToolNavigation ? (
          <Link
            href="/map"
            className="bg-primary text-primary-foreground hidden min-h-11 items-center rounded-xl px-4 text-sm font-bold transition-colors hover:opacity-95 md:inline-flex"
          >
            Ouvrir la carte
          </Link>
        ) : null}

        <ThemeToggle />

        <Link
          href="/pourquoi-photoatlas"
          className="text-muted-foreground hover:bg-accent hover:text-foreground hidden min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors md:inline-flex"
          aria-current={isAboutPage ? "page" : undefined}
        >
          À propos
        </Link>
      </div>
    </header>
  );
}
