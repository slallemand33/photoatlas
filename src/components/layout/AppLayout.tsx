"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { MapProvider } from "@/components/map";
import { PlaceDetailsPanel } from "@/features/place-details";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, refetchOnWindowFocus: false },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MapProvider>
        <>
          <a
            href="#main-content"
            className="focus:bg-background focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:ring-2"
          >
            Aller au contenu principal
          </a>

          <div className="bg-background text-foreground flex h-dvh flex-col">
            <Header
              onMobileMenuToggle={() => setMobileSidebarOpen((v) => !v)}
              mobileSidebarOpen={mobileSidebarOpen}
            />

            <div className="relative flex flex-1 overflow-hidden">
              {mobileSidebarOpen && (
                <div
                  className="bg-overlay fixed inset-0 z-30 backdrop-blur-sm lg:hidden"
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-hidden="true"
                />
              )}

              <Sidebar
                collapsed={sidebarCollapsed}
                onCollapsedToggle={() => setSidebarCollapsed((v) => !v)}
                mobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
              />

              <div className="flex flex-1 flex-col overflow-hidden">
                {children}
                <Footer />
              </div>
              {pathname === "/" && <PlaceDetailsPanel />}
            </div>
          </div>
        </>
      </MapProvider>
    </QueryClientProvider>
  );
}
