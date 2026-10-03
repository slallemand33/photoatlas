"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const THEME_STORAGE_KEY = "photoatlas-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function handleThemeChange(nextTheme: Theme) {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  return (
    <div
      className="border-border bg-muted/70 inline-flex items-center gap-1 rounded-xl border p-1"
      role="group"
      aria-label="Choix du thème"
    >
      <button
        type="button"
        onClick={() => handleThemeChange("light")}
        aria-label="Activer le thème clair"
        title="Activer le thème clair"
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
          theme === "light"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        )}
        aria-pressed={theme === "light"}
      >
        <Sun className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Clair</span>
      </button>
      <button
        type="button"
        onClick={() => handleThemeChange("dark")}
        aria-label="Activer le thème sombre"
        title="Activer le thème sombre"
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors",
          theme === "dark"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
        )}
        aria-pressed={theme === "dark"}
      >
        <Moon className="h-4 w-4" aria-hidden="true" />
        <span className="hidden sm:inline">Sombre</span>
      </button>
    </div>
  );
}