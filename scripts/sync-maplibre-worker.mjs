import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const maplibreDist = join(projectRoot, "node_modules", "maplibre-gl", "dist");
const publicWorkerDir = join(projectRoot, "public", "maplibre");
const workerModules = ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"];

await mkdir(publicWorkerDir, { recursive: true });

await Promise.all(
  workerModules.map((filename) =>
    copyFile(join(maplibreDist, filename), join(publicWorkerDir, filename)),
  ),
);

console.log("MapLibre worker modules copied to public/maplibre");
