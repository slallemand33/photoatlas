    const MAPTILER_API_BASE = "https://api.maptiler.com/maps";

    /** Clé API lue depuis la variable d'environnement Next.js */
    export const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY ?? "";

    export function hasMaptilerKey(): boolean {
    return MAPTILER_KEY.trim().length > 0;
    }

    export function getMaptilerStyleUrl(styleId: string): string {
    return `${MAPTILER_API_BASE}/${styleId}/style.json?key=${MAPTILER_KEY}`;
    }
