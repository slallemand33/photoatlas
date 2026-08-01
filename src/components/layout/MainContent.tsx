import { MapView } from "@/components/map";

export function MainContent() {
  return (
    <main
      id="main-content"
      className="relative flex flex-1 overflow-hidden"
      role="main"
      aria-label="Zone de la carte"
      tabIndex={-1}
    >
      <MapView />
    </main>
  );
}
