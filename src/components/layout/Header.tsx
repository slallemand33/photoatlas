"use client";

import { Aperture, Bell, Menu, User } from "lucide-react";
import Link from "next/link";

import { SearchBar } from "@/features/search/components";

interface HeaderProps {
  onMobileMenuToggle: () => void;
  mobileSidebarOpen: boolean;
}

export function Header({ onMobileMenuToggle, mobileSidebarOpen }: HeaderProps) {
  return (
    <header
      className="border-border bg-background/95 relative z-10 flex h-16 shrink-0 items-center gap-3 border-b px-4 shadow-sm backdrop-blur-xl"
      role="banner"
    >
      {/* Hamburger — mobile uniquement */}
      <button
        className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors lg:hidden"
        onClick={onMobileMenuToggle}
        aria-label={mobileSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={mobileSidebarOpen}
        aria-controls="app-sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

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
      <SearchBar />

      {/* Actions droite */}
      <div className="ml-auto flex items-center gap-1">
        {/* Notifications — placeholder */}
        <button
          className="text-muted-foreground hidden h-11 w-11 items-center justify-center rounded-xl transition-colors sm:flex"
          aria-label="Notifications (bientôt disponible)"
          disabled
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Profil — placeholder */}
        <button
          className="bg-muted text-muted-foreground hover:bg-accent hover:text-foreground flex h-11 w-11 items-center justify-center rounded-full transition-colors"
          aria-label="Profil utilisateur (bientôt disponible)"
          disabled
        >
          <User className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
