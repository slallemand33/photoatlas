"use client";

import { Aperture, Bell, Menu, User } from "lucide-react";

import { SearchBar } from "@/features/search/components";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  mobileSidebarOpen: boolean;
}

export function Header({ onMobileMenuToggle, mobileSidebarOpen }: HeaderProps) {
  return (
    <header
      className="relative z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/40 bg-background/95 px-3 backdrop-blur-sm"
      role="banner"
    >
      {/* Hamburger — mobile uniquement */}
      <button
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
        onClick={onMobileMenuToggle}
        aria-label={mobileSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="app-sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Logo */}
      <a
        href="/"
        className="flex shrink-0 items-center gap-2 rounded-md px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="PhotoAtlas — Accueil"
      >
        <Aperture className="h-6 w-6 text-primary" aria-hidden="true" />
        <span className="text-base font-semibold tracking-tight">PhotoAtlas</span>
      </a>

      {/* Barre de recherche */}
      <SearchBar />

      {/* Actions droite */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notifications — placeholder */}
        <button
          className="hidden h-9 w-9 items-center justify-center rounded-md text-muted-foreground/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          aria-label="Notifications (bientôt disponible)"
          disabled
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Profil — placeholder */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Profil utilisateur (bientôt disponible)"
          disabled
        >
          <User className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
