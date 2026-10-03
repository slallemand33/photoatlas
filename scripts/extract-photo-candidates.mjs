import { spawnSync } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { basename, dirname, resolve } from "node:path";
import { createInterface } from "node:readline";

const root = process.cwd();

function parseArgs(argv) {
  const options = new Map();
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      options.set(key, true);
      continue;
    }
    options.set(key, value);
    index += 1;
  }
  return options;
}

const args = parseArgs(process.argv.slice(2));

const sourcePbf = resolve(root, String(args.get("source") ?? "data/osm/bretagne/bretagne-latest.osm.pbf"));
const outputJsonl = resolve(root, String(args.get("output") ?? "data/osm/bretagne/bretagne-photo-candidates.jsonl"));
const statsJson = resolve(root, String(args.get("stats") ?? "data/osm/bretagne/bretagne-photo-candidates.stats.json"));
const region = String(args.get("region") ?? "Bretagne");

const referenceSql = resolve(root, "supabase/seed/20261001_photoatlas_compatibility_reference.sql");

if (!existsSync(sourcePbf)) {
  console.error(`Source PBF introuvable: ${sourcePbf}`);
  process.exit(1);
}

mkdirSync(dirname(outputJsonl), { recursive: true });
mkdirSync(dirname(statsJson), { recursive: true });

function run(command, commandArgs, label, inherit = true) {
  const result = spawnSync(command, commandArgs, {
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf8",
  });
  if (result.status !== 0) {
    if (!inherit && result.stderr) console.error(result.stderr);
    console.error(`${label} a échoué.`);
    process.exit(result.status ?? 1);
  }
  return result;
}

function capture(command, commandArgs, label) {
  return run(command, commandArgs, label, false).stdout;
}

function parseReferenceTypes(sqlText) {
  const validTypes = new Set();
  const familyByType = new Map();
  const familyLabels = new Map([
    ["littoral", "Littoral"],
    ["maritime", "Maritime"],
    ["nature", "Nature"],
    ["relief", "Relief"],
    ["architecture", "Architecture"],
    ["observation", "Observation"],
    ["faune", "Faune"],
    ["structures", "Structures"],
    ["other", "other"],
  ]);

  let inLeafTypes = false;
  for (const line of sqlText.split("\n")) {
    if (line.includes("with leaf_types(")) {
      inLeafTypes = true;
      continue;
    }
    if (inLeafTypes && line.includes(")") && line.includes("insert into public.spot_types")) {
      inLeafTypes = false;
    }
    if (!inLeafTypes) continue;

    const match = line.match(/^\s*\('([^']+)',\s*'((?:[^']|'')*)',\s*(null|'([^']+)')/);
    if (!match) continue;

    const slug = match[1];
    const parentSlug = match[4] ?? null;
    validTypes.add(slug);
    familyByType.set(slug, parentSlug ? (familyLabels.get(parentSlug) ?? "other") : "other");
  }

  validTypes.add("other");
  familyByType.set("other", "other");

  return { validTypes, familyByType };
}

const referenceContent = await readFile(referenceSql, "utf8");
const { validTypes, familyByType } = parseReferenceTypes(referenceContent);

const filterExpressions = [
  "nwr/tourism=viewpoint,attraction,observatory,artwork",
  "nwr/man_made=lighthouse,observatory,pier,quay,mill,dam,windmill",
  "nwr/tower:type=observation",
  "nwr/name=*Observatoire*",
  "nwr/harbour",
  "nwr/leisure=marina,nature_reserve,bird_hide",
  "nwr/boundary=protected_area",
  "nwr/natural=peak,cliff,dune,cave_entrance,island,beach,bay,wetland,wood,forest",
  "nwr/waterway=waterfall,dam",
  "nwr/historic=castle,ruins,monument,fort,manor,archaeological_site,bridge",
  "nwr/building=castle",
  "nwr/bridge",
  "nwr/power=generator",
  "nwr/generator:source=wind",
];

const tempPrefix = `/tmp/photoatlas-${basename(outputJsonl, ".jsonl")}-${process.pid}`;
const expressionsFile = `${tempPrefix}.expressions.txt`;
const filteredPbf = `${tempPrefix}.osm.pbf`;
const exportedGeoJsonSeq = `${tempPrefix}.geojsonseq`;

await writeFile(expressionsFile, `${filterExpressions.join("\n")}\n`, "utf8");

const extractionStartedAt = Date.now();

const sourceFileInfo = capture("osmium", ["fileinfo", "-e", sourcePbf], "fileinfo source");

run(
  "osmium",
  [
    "tags-filter",
    "--expressions",
    expressionsFile,
    "-t",
    "-o",
    filteredPbf,
    "-O",
    sourcePbf,
  ],
  "Filtrage tags-filter",
);

run(
  "osmium",
  [
    "export",
    "-f",
    "geojsonseq",
    "-a",
    "type,id",
    "-o",
    exportedGeoJsonSeq,
    "-O",
    filteredPbf,
  ],
  "Export geojsonseq",
);

const filteredFileInfo = capture("osmium", ["fileinfo", "-e", filteredPbf], "fileinfo filtré");

const retainedTagKeys = new Set([
  "name",
  "name:fr",
  "official_name",
  "tourism",
  "natural",
  "waterway",
  "man_made",
  "historic",
  "leisure",
  "amenity",
  "boundary",
  "designation",
  "heritage",
  "ref:mhs",
  "ref:FR:INPN",
  "wikidata",
  "wikipedia",
  "website",
  "description",
  "bridge",
  "building",
  "tower:type",
  "tower:construction",
  "power",
  "generator:source",
  "harbour",
  "seamark:type",
  "seamark:name",
  "protect_class",
  "protection_title",
]);

function normalizeTagSubset(tags) {
  return Object.fromEntries(
    Object.entries(tags).filter(([key, value]) => retainedTagKeys.has(key) && value !== null && value !== ""),
  );
}

function flattenCoordinates(coordinates, result = []) {
  if (!Array.isArray(coordinates)) return result;
  if (coordinates.length >= 2 && typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    result.push([coordinates[0], coordinates[1]]);
    return result;
  }
  for (const item of coordinates) flattenCoordinates(item, result);
  return result;
}

function representativePoint(geometry) {
  if (!geometry || !geometry.coordinates) return { latitude: null, longitude: null, coordinateSource: "unknown" };
  if (geometry.type === "Point") {
    return {
      longitude: geometry.coordinates[0] ?? null,
      latitude: geometry.coordinates[1] ?? null,
      coordinateSource: "node",
    };
  }
  const coordinates = flattenCoordinates(geometry.coordinates);
  if (coordinates.length === 0) {
    return { latitude: null, longitude: null, coordinateSource: "unknown" };
  }
  let minLon = Number.POSITIVE_INFINITY;
  let minLat = Number.POSITIVE_INFINITY;
  let maxLon = Number.NEGATIVE_INFINITY;
  let maxLat = Number.NEGATIVE_INFINITY;
  for (const [lon, lat] of coordinates) {
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  }
  const coordinateSource = geometry.type === "LineString" || geometry.type === "MultiLineString"
    ? "representative_way_bbox_center"
    : "representative_area_bbox_center";
  return {
    longitude: (minLon + maxLon) / 2,
    latitude: (minLat + maxLat) / 2,
    coordinateSource,
  };
}

function detectPrincipalTag(tags) {
  const orderedKeys = [
    ["man_made", ["lighthouse", "observatory", "pier", "quay", "mill", "dam", "windmill"]],
    ["tower:type", ["observation"]],
    ["tourism", ["viewpoint", "attraction", "observatory", "artwork"]],
    ["natural", ["peak", "cliff", "dune", "cave_entrance", "island", "beach", "bay", "wetland", "wood", "forest"]],
    ["waterway", ["waterfall", "dam"]],
    ["historic", ["castle", "ruins", "monument", "fort", "manor", "archaeological_site", "bridge"]],
    ["leisure", ["marina", "nature_reserve", "bird_hide"]],
    ["boundary", ["protected_area"]],
    ["power", ["generator"]],
    ["generator:source", ["wind"]],
  ];

  for (const [key, values] of orderedKeys) {
    const value = tags[key];
    if (!value) continue;
    if (!values || values.includes(value)) return `${key}=${value}`;
  }
  if (tags.harbour) return `harbour=${tags.harbour}`;
  if (tags.bridge) return `bridge=${tags.bridge}`;
  return "unknown";
}

function inferPhotoAtlasType(tags) {
  const name = String(tags.name ?? tags["name:fr"] ?? tags.official_name ?? tags["seamark:name"] ?? "");
  const description = String(tags.description ?? "");
  const combinedText = `${name} ${description}`.toLowerCase();

  if (tags.man_made === "lighthouse") return "lighthouse";
  if (tags.tourism === "observatory" || tags.man_made === "observatory" || tags["tower:type"] === "observation" || combinedText.includes("observatoire")) return "observatory";
  if (tags.waterway === "waterfall") return "waterfall";
  if (tags.natural === "peak") return "summit";
  if (tags.natural === "dune") return "dune";
  if (tags.tourism === "viewpoint") return "viewpoint";
  if (tags.natural === "cliff") return "sea_cliff";
  if (tags.natural === "beach") return "beach";
  if (tags.natural === "bay") return "bay";
  if (tags.natural === "wetland") return "wetland";
  if (tags.natural === "wood" || tags.natural === "forest") return "forest";
  if (tags.leisure === "bird_hide") return "wildlife_site";
  if (tags.leisure === "nature_reserve") {
    if (combinedText.includes("ornitho") || combinedText.includes("bird")) return "bird_reserve";
    return "nature_reserve";
  }
  if (tags.boundary === "protected_area") {
    if (combinedText.includes("ornitho") || combinedText.includes("bird")) return "bird_reserve";
    return "nature_reserve";
  }
  if (tags.man_made === "pier") return "pier";
  if (tags.man_made === "quay" || tags.harbour === "quay") return "quay";
  if (tags.harbour || tags.leisure === "marina") {
    if (combinedText.includes("ostréi") || combinedText.includes("ostrei") || combinedText.includes("oyster")) return "oyster_harbour";
    return "harbour";
  }
  if (tags.historic === "castle" || tags.building === "castle") return "castle";
  if (tags.historic === "fort") return "fortification";
  if (tags.historic === "ruins") return "ruins";
  if (tags.historic === "monument") return "monument";
  if (tags.bridge || tags.historic === "bridge") return "bridge";
  if (tags.man_made === "mill" || tags.man_made === "windmill") return "mill";
  if (tags.waterway === "dam" || tags.man_made === "dam") return "dam";
  if (tags.power === "generator" && tags["generator:source"] === "wind") return "wind_farm";
  return "other";
}

function deriveFamily(photoAtlasType) {
  return familyByType.get(photoAtlasType) ?? "other";
}

function geometryRank(feature) {
  switch (feature?.geometry?.type) {
    case "Polygon":
    case "MultiPolygon":
      return 4;
    case "LineString":
    case "MultiLineString":
      return 3;
    case "Point":
      return 2;
    default:
      return 1;
  }
}

const stats = {
  region,
  source: {
    path: sourcePbf,
    sizeBytes: statSync(sourcePbf).size,
    fileinfo: sourceFileInfo,
  },
  extraction: {
    filteredPbfPath: filteredPbf,
    exportedGeoJsonSeqPath: exportedGeoJsonSeq,
    filteredFileinfo: filteredFileInfo,
    objectsTraversed: 0,
    durationMs: 0,
  },
  totalCandidates: 0,
  byOsmType: { node: 0, way: 0, relation: 0 },
  byPhotoAtlasType: {},
  byPhotoAtlasFamily: {},
  documentation: {
    wikidata: 0,
    wikipedia: 0,
    description: 0,
    website: 0,
    protection: 0,
    heritage: 0,
  },
  geometry: {
    nodes: 0,
    ways: 0,
    relations: 0,
  },
  quality: {
    jsonl: "PASS",
    placeKeyUniques: 0,
    duplicatePlaceKeys: 0,
    invalidCoordinates: 0,
    invalidTypes: 0,
    anomalies: 0,
  },
  collapsedDuplicates: 0,
};

const writer = createWriteStream(outputJsonl, { encoding: "utf8" });
const reader = createInterface({ input: createReadStream(exportedGeoJsonSeq, { encoding: "utf8" }), crlfDelay: Infinity });
const mergedCandidates = new Map();

for await (const line of reader) {
  const normalizedLine = line.replace(/^\u001e/, "").trim();
  if (!normalizedLine) continue;
  stats.extraction.objectsTraversed += 1;
  const feature = JSON.parse(normalizedLine);
  const properties = feature.properties ?? {};
  const tags = normalizeTagSubset(
    Object.fromEntries(Object.entries(properties).filter(([key]) => !key.startsWith("@"))),
  );

  const osmType = properties["@type"] ?? null;
  const osmId = properties["@id"] ?? null;
  const name = tags.name ?? tags["seamark:name"] ?? null;
  const nameFr = tags["name:fr"] ?? null;
  const officialName = tags.official_name ?? null;

  if (!name && !nameFr && !officialName) continue;

  const { latitude, longitude, coordinateSource } = representativePoint(feature.geometry);
  const photoAtlasType = inferPhotoAtlasType(tags);
  const safePhotoAtlasType = validTypes.has(photoAtlasType) ? photoAtlasType : "other";
  const photoAtlasFamily = deriveFamily(safePhotoAtlasType);
  const principalTag = detectPrincipalTag(tags);
  const sourceExternalId = `osm:${osmType}/${osmId}`;
  const placeKey = sourceExternalId;

  const candidate = {
    placeKey,
    osmType,
    osmId,
    sourceExternalId,
    name,
    nameFr,
    officialName,
    latitude,
    longitude,
    coordinateSource,
    principalTag,
    photoAtlasType: safePhotoAtlasType,
    photoAtlasFamily,
    osmRepresentations: [
      {
        osmType,
        osmId,
        sourceExternalId,
        principalTag,
        coordinateSource,
        isPrimary: true,
      },
    ],
    tags,
  };

  const objectKey = `${osmType}/${osmId}`;
  const previous = mergedCandidates.get(objectKey);
  if (!previous) {
    mergedCandidates.set(objectKey, { candidate, feature });
  } else {
    stats.collapsedDuplicates += 1;
    if (geometryRank(feature) > geometryRank(previous.feature)) {
      mergedCandidates.set(objectKey, { candidate, feature });
    }
  }
}

const placeKeys = new Set();

for (const { candidate } of mergedCandidates.values()) {
  stats.totalCandidates += 1;
  stats.byOsmType[candidate.osmType] = (stats.byOsmType[candidate.osmType] ?? 0) + 1;
  stats.geometry[`${candidate.osmType}s`] = (stats.geometry[`${candidate.osmType}s`] ?? 0) + 1;
  stats.byPhotoAtlasType[candidate.photoAtlasType] = (stats.byPhotoAtlasType[candidate.photoAtlasType] ?? 0) + 1;
  stats.byPhotoAtlasFamily[candidate.photoAtlasFamily] = (stats.byPhotoAtlasFamily[candidate.photoAtlasFamily] ?? 0) + 1;

  if (candidate.tags.wikidata) stats.documentation.wikidata += 1;
  if (candidate.tags.wikipedia) stats.documentation.wikipedia += 1;
  if (candidate.tags.description) stats.documentation.description += 1;
  if (candidate.tags.website) stats.documentation.website += 1;
  if (candidate.tags.boundary === "protected_area" || candidate.tags.leisure === "nature_reserve" || candidate.tags["ref:FR:INPN"] || candidate.tags.designation || candidate.tags.protect_class) stats.documentation.protection += 1;
  if (candidate.tags.heritage || candidate.tags["ref:mhs"] || candidate.tags.historic) stats.documentation.heritage += 1;

  if (!placeKeys.add(candidate.placeKey)) {
    stats.quality.duplicatePlaceKeys += 1;
    stats.quality.anomalies += 1;
  }
  if (!Number.isFinite(candidate.latitude) || !Number.isFinite(candidate.longitude) || candidate.latitude < -90 || candidate.latitude > 90 || candidate.longitude < -180 || candidate.longitude > 180) {
    stats.quality.invalidCoordinates += 1;
    stats.quality.anomalies += 1;
  }
  if (!validTypes.has(candidate.photoAtlasType) && candidate.photoAtlasType !== "other") {
    stats.quality.invalidTypes += 1;
    stats.quality.anomalies += 1;
  }

  writer.write(`${JSON.stringify(candidate)}\n`);
}

writer.end();
await new Promise((resolveDone) => writer.on("finish", resolveDone));

stats.quality.placeKeyUniques = placeKeys.size;
stats.extraction.durationMs = Date.now() - extractionStartedAt;
stats.extraction.selectionRate = Number((stats.totalCandidates / Math.max(stats.extraction.objectsTraversed, 1)).toFixed(6));

await writeFile(statsJson, `${JSON.stringify(stats, null, 2)}\n`, "utf8");

rmSync(expressionsFile, { force: true });
rmSync(filteredPbf, { force: true });
rmSync(exportedGeoJsonSeq, { force: true });

console.log(JSON.stringify({
  sourcePbf,
  outputJsonl,
  statsJson,
  objectsTraversed: stats.extraction.objectsTraversed,
  totalCandidates: stats.totalCandidates,
  durationMs: stats.extraction.durationMs,
  anomalies: stats.quality.anomalies,
}, null, 2));