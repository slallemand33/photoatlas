import { spawnSync } from "node:child_process";
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

const root = process.cwd();
const sourcePbf = resolve(root, "data/osm/aquitaine-latest.osm.pbf");
const filteredPbf = resolve(root, "data/osm/aquitaine-photo-candidates.osm.pbf");
const candidatesJsonl = resolve(root, "data/osm/aquitaine-photo-candidates.jsonl");
const statsJson = resolve(root, "data/osm/aquitaine-photo-candidates.stats.json");
const expressionsFile = resolve(root, "data/osm/aquitaine-photo-candidates.expressions.txt");

if (!existsSync(sourcePbf)) {
  console.error(`Source PBF introuvable: ${sourcePbf}`);
  process.exit(1);
}

mkdirSync(resolve(root, "data/osm"), { recursive: true });

const filterExpressions = [
  "nwr/natural=beach,dune,cliff,coastline,bay,wetland,water,peak,valley,gorge,plateau",
  "nwr/waterway=waterfall",
  "nwr/tourism=viewpoint,attraction,observatory,information",
  "nwr/man_made=lighthouse,pier,breakwater,observatory,quay,mill,dam,windmill",
  "nwr/tower:type=observation",
  "nwr/name=*Observatoire*",
  "nwr/harbour",
  "nwr/leisure=marina,nature_reserve,wildlife_park",
  "nwr/boundary=protected_area",
  "nwr/historic=castle,ruins,monument,archaeological_site,bridge",
  "nwr/building=castle",
  "nwr/amenity=place_of_worship",
  "nwr/astronomy",
  "nwr/power=generator",
  "nwr/generator:source=wind",
  "nwr/place=village",
  "nwr/natural=forest",
];

await writeFile(expressionsFile, `${filterExpressions.join("\n")}\n`, "utf8");

function run(command, args, label) {
  const result = spawnSync(command, args, { stdio: "inherit", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(`${label} a échoué.`);
    process.exit(result.status ?? 1);
  }
}

function runCapture(command, args, label) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || `${label} a échoué.`);
    process.exit(result.status ?? 1);
  }
  return result.stdout;
}

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

const exportProcess = spawnSync(
  "osmium",
  [
    "export",
    "-f",
    "geojsonseq",
    "-a",
    "type,id",
    "-o",
    candidatesJsonl,
    "-O",
    filteredPbf,
  ],
  { stdio: "inherit", encoding: "utf8" },
);

if (exportProcess.status !== 0) {
  console.error("Export geojsonseq a échoué.");
  process.exit(exportProcess.status ?? 1);
}

const genericAttractionKeys = new Set(["tourism=attraction", "tourism=information"]);
const largeAreaTagPairs = new Set([
  "natural=wetland",
  "natural=water",
  "natural=forest",
  "boundary=protected_area",
  "leisure=nature_reserve",
  "leisure=wildlife_park",
]);

const candidateTagMatchers = [
  { key: "natural", values: new Set(["beach", "dune", "cliff", "coastline", "bay", "wetland", "water", "peak", "valley", "gorge", "plateau", "forest"]), family: (value) => {
      if (["beach", "dune", "cliff", "coastline", "bay"].includes(value)) return "Littoral";
      if (["wetland", "water", "forest"].includes(value)) return "Nature";
      if (["peak", "valley", "gorge", "plateau"].includes(value)) return "Relief";
      return "UNMAPPED";
    } },
  { key: "waterway", values: new Set(["waterfall", "dam"]), family: (value) => value === "waterfall" ? "Nature" : "Structures" },
  { key: "tourism", values: new Set(["viewpoint", "attraction", "observatory", "information"]), family: (value) => {
      if (value === "viewpoint") return "Relief";
      if (value === "observatory") return "Observation";
      return "UNMAPPED";
    } },
  { key: "tower:type", values: new Set(["observation"]), family: () => "Observation" },
  { key: "man_made", values: new Set(["lighthouse", "pier", "breakwater", "observatory", "quay", "mill", "dam", "windmill"]), family: (value) => {
      if (["lighthouse", "pier", "breakwater", "quay"].includes(value)) return "Maritime";
      if (value === "observatory") return "Observation";
      return "Structures";
    } },
  { key: "harbour", values: null, family: () => "Maritime" },
  { key: "leisure", values: new Set(["marina", "nature_reserve", "wildlife_park"]), family: (value) => {
      if (value === "marina") return "Maritime";
      if (value === "wildlife_park") return "Faune";
      return "Nature";
    } },
  { key: "boundary", values: new Set(["protected_area"]), family: () => "Nature" },
  { key: "historic", values: new Set(["castle", "ruins", "monument", "archaeological_site", "bridge"]), family: () => "Architecture" },
  { key: "building", values: new Set(["castle"]), family: () => "Architecture" },
  { key: "amenity", values: new Set(["place_of_worship"]), family: () => "Architecture" },
  { key: "astronomy", values: null, family: () => "Observation" },
  { key: "power", values: new Set(["generator"]), family: () => "Structures" },
  { key: "generator:source", values: new Set(["wind"]), family: () => "Structures" },
  { key: "place", values: new Set(["village"]), family: () => "UNMAPPED" },
];

function detectPrincipalTag(tags) {
  for (const matcher of candidateTagMatchers) {
    const value = tags[matcher.key];
    if (!value) continue;
    if (!matcher.values || matcher.values.has(value)) {
      return `${matcher.key}=${value}`;
    }
  }
  return "unknown";
}

function inferFamily(tags) {
  for (const matcher of candidateTagMatchers) {
    const value = tags[matcher.key];
    if (!value) continue;
    if (!matcher.values || matcher.values.has(value)) {
      return matcher.family(value);
    }
  }
  return "UNMAPPED";
}

function toPoint(geometry) {
  if (!geometry || !geometry.coordinates) return { latitude: null, longitude: null };
  if (geometry.type === "Point") {
    return { longitude: geometry.coordinates[0] ?? null, latitude: geometry.coordinates[1] ?? null };
  }
  if (geometry.type === "Polygon") {
    const first = geometry.coordinates?.[0]?.[0];
    return { longitude: first?.[0] ?? null, latitude: first?.[1] ?? null };
  }
  if (geometry.type === "MultiPolygon") {
    const first = geometry.coordinates?.[0]?.[0]?.[0];
    return { longitude: first?.[0] ?? null, latitude: first?.[1] ?? null };
  }
  if (geometry.type === "LineString") {
    const first = geometry.coordinates?.[0];
    return { longitude: first?.[0] ?? null, latitude: first?.[1] ?? null };
  }
  if (geometry.type === "MultiLineString") {
    const first = geometry.coordinates?.[0]?.[0];
    return { longitude: first?.[0] ?? null, latitude: first?.[1] ?? null };
  }
  return { longitude: null, latitude: null };
}

const stats = {
  source: {
    path: sourcePbf,
    sizeBytes: statSync(sourcePbf).size,
    fileinfo: runCapture("osmium", ["fileinfo", "-e", sourcePbf], "fileinfo source"),
  },
  filtered: {
    path: filteredPbf,
    sizeBytes: statSync(filteredPbf).size,
    fileinfo: runCapture("osmium", ["fileinfo", "-e", filteredPbf], "fileinfo filtré"),
  },
  candidateObjects: 0,
  withCoordinates: 0,
  principalTagCounts: {},
  familyCounts: {
    Littoral: 0,
    Maritime: 0,
    Nature: 0,
    Relief: 0,
    Architecture: 0,
    Observation: 0,
    Faune: 0,
    Structures: 0,
    UNMAPPED: 0,
  },
  largeAreaCandidates: 0,
  genericTourismCandidates: 0,
  exportDuplicateObjectsCollapsed: 0,
};

const tempValidatedJsonl = `${candidatesJsonl}.validated`;
const writer = createWriteStream(tempValidatedJsonl, { encoding: "utf8" });
const reader = createInterface({ input: createReadStream(candidatesJsonl, { encoding: "utf8" }), crlfDelay: Infinity });
const mergedCandidates = new Map();

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

for await (const line of reader) {
  const normalizedLine = line.replace(/^\u001e/, "").trim();
  if (!normalizedLine) continue;
  const feature = JSON.parse(normalizedLine);
  const properties = feature.properties ?? {};
  const tags = Object.fromEntries(
    Object.entries(properties).filter(([key]) => !key.startsWith("@")),
  );
  const { latitude, longitude } = toPoint(feature.geometry);
  const principalTag = detectPrincipalTag(tags);
  const family = inferFamily(tags);
  const largeAreaCandidate = largeAreaTagPairs.has(principalTag) && ["Polygon", "MultiPolygon"].includes(feature.geometry?.type);
  const genericTourismCandidate = genericAttractionKeys.has(principalTag) && family === "UNMAPPED";

  const candidate = {
    osmType: properties["@type"] ?? null,
    osmId: properties["@id"] ?? null,
    name: tags.name ?? tags["seamark:name"] ?? null,
    nameFr: tags["name:fr"] ?? null,
    officialName: tags.official_name ?? null,
    latitude,
    longitude,
    coordinateSource:
      properties["@type"] === "node"
        ? "node"
        : properties["@type"] === "way"
          ? "representative_way_geometry"
          : properties["@type"] === "relation"
            ? "representative_relation_geometry"
            : "unknown",
    principalTag,
    potentialFamily: family,
    large_area_candidate: largeAreaCandidate,
    generic_tourism_candidate: genericTourismCandidate,
    tags,
  };
  const objectKey = `${candidate.osmType}/${candidate.osmId}`;
  const previous = mergedCandidates.get(objectKey);
  if (!previous) {
    mergedCandidates.set(objectKey, { candidate, feature });
  } else {
    stats.exportDuplicateObjectsCollapsed += 1;
    const previousRank = geometryRank(previous.feature);
    const nextRank = geometryRank(feature);
    if (nextRank > previousRank) {
      mergedCandidates.set(objectKey, { candidate, feature });
    }
  }
}

for (const { candidate } of mergedCandidates.values()) {
  stats.candidateObjects += 1;
  if (candidate.latitude !== null && candidate.longitude !== null) stats.withCoordinates += 1;
  stats.principalTagCounts[candidate.principalTag] = (stats.principalTagCounts[candidate.principalTag] ?? 0) + 1;
  stats.familyCounts[candidate.potentialFamily] = (stats.familyCounts[candidate.potentialFamily] ?? 0) + 1;
  if (candidate.large_area_candidate) stats.largeAreaCandidates += 1;
  if (candidate.generic_tourism_candidate) stats.genericTourismCandidates += 1;
  writer.write(`${JSON.stringify(candidate)}\n`);
}

writer.end();
await new Promise((resolveDone) => writer.on("finish", resolveDone));

const validatedContent = await readFile(tempValidatedJsonl, "utf8");
await writeFile(candidatesJsonl, validatedContent, "utf8");

stats.reductionRatio = Number((1 - stats.filtered.sizeBytes / stats.source.sizeBytes).toFixed(4));
stats.reductionPercent = Number((stats.reductionRatio * 100).toFixed(2));

await writeFile(statsJson, JSON.stringify(stats, null, 2), "utf8");

console.log(JSON.stringify({
  filteredPbf,
  candidatesJsonl,
  statsJson,
  candidateObjects: stats.candidateObjects,
  reductionPercent: stats.reductionPercent,
}, null, 2));