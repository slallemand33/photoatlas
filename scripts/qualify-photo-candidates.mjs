import { createReadStream, existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
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

const inputJsonl = resolve(root, String(args.get("source") ?? "data/osm/bretagne/bretagne-photo-candidates.jsonl"));
const outputJson = resolve(root, String(args.get("output") ?? "data/osm/bretagne/bretagne-premium-candidates.json"));
const outputStats = resolve(root, String(args.get("stats") ?? "data/osm/bretagne/bretagne-premium-candidates.stats.json"));
const outputQa = resolve(root, String(args.get("qa") ?? "data/osm/bretagne/bretagne-premium-qualification-qa.md"));
const region = String(args.get("region") ?? "Bretagne");
const referenceSql = resolve(root, "supabase/seed/20261001_photoatlas_compatibility_reference.sql");
const aquitaineStatsPath = resolve(root, "data/osm/photoatlas-premium-aquitaine.stats.json");
const aquitaineReviewPath = resolve(root, "data/osm/photoatlas-premium-aquitaine-review.json");

if (!existsSync(inputJsonl)) {
  console.error(`Fichier candidats introuvable: ${inputJsonl}`);
  process.exit(1);
}

if (!existsSync(referenceSql)) {
  console.error(`Référentiel introuvable: ${referenceSql}`);
  process.exit(1);
}

const remarkableThreshold = 40;
const photographicThreshold = 50;
const premiumThreshold = 80;
const reviewHeuristic = {
  baseRankingScore: 50,
  remarkableScore: remarkableThreshold - 10,
  photographicScore: photographicThreshold - 10,
};

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

const strongSignalTypes = new Set([
  "lighthouse",
  "waterfall",
  "sea_cliff",
  "summit",
  "castle",
  "fortification",
  "abbey",
  "monument",
  "observatory",
  "nature_reserve",
  "bird_reserve",
  "viewpoint",
  "dune",
  "gorge",
  "cave",
  "island",
  "bay",
  "ruins",
]);

const genericTypes = new Set([
  "bridge",
  "other",
  "beach",
  "pier",
  "quay",
  "forest",
  "harbour",
  "wind_farm",
  "wetland",
]);

const largeAreaTypes = new Set([
  "bay",
  "beach",
  "forest",
  "wetland",
  "nature_reserve",
  "bird_reserve",
  "island",
]);

const scoreByType = {
  lighthouse: 28,
  waterfall: 28,
  sea_cliff: 27,
  summit: 28,
  castle: 12,
  fortification: 20,
  abbey: 22,
  monument: 14,
  observatory: 24,
  nature_reserve: 20,
  bird_reserve: 23,
  viewpoint: 26,
  dune: 29,
  gorge: 27,
  cave: 22,
  island: 24,
  bay: 22,
  ruins: 22,
  beach: 14,
  harbour: 18,
  pier: 25,
  quay: 18,
  forest: 8,
  wetland: 12,
  bridge: 12,
  mill: 22,
  dam: 18,
  wind_farm: 16,
  other: 8,
};

function parseReferenceTypes(sqlText) {
  const validTypes = new Set(["other"]);
  const familyByType = new Map([["other", "other"]]);
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

  return { validTypes, familyByType };
}

function normalizeName(name) {
  return String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
}

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function distanceMeters(a, b) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const hav =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(hav));
}

function parseNumericTag(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/);
  if (!normalized) return null;
  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasAnyTag(tags, keys) {
  return keys.some((key) => Boolean(tags[key]));
}

function documentaryKey(item) {
  const tags = item.tags ?? item.osmTags ?? {};
  return tags.wikidata ?? tags.wikipedia ?? tags["ref:mhs"] ?? tags["ref:FR:INPN"] ?? null;
}

function statusRank(status) {
  return { premium: 3, review: 2, rejected: 1 }[status] ?? 0;
}

function confidenceRank(confidence) {
  return { HIGH: 3, MEDIUM: 2, LOW: 1 }[confidence] ?? 0;
}

function scoreBucket(score) {
  const lower = Math.floor(score / 10) * 10;
  const upper = lower + 9;
  return `${lower}-${upper}`;
}

function buildSpatialIndex(items) {
  const cellSize = 0.03;
  const grid = new Map();
  for (const item of items) {
    if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) continue;
    const latKey = Math.floor(item.latitude / cellSize);
    const lonKey = Math.floor(item.longitude / cellSize);
    const key = `${latKey}:${lonKey}`;
    const list = grid.get(key) ?? [];
    list.push(item);
    grid.set(key, list);
  }
  return { cellSize, grid };
}

function nearbyCandidates(item, spatialIndex) {
  if (!Number.isFinite(item.latitude) || !Number.isFinite(item.longitude)) return [];
  const { cellSize, grid } = spatialIndex;
  const latKey = Math.floor(item.latitude / cellSize);
  const lonKey = Math.floor(item.longitude / cellSize);
  const results = [];
  for (let latOffset = -1; latOffset <= 1; latOffset += 1) {
    for (let lonOffset = -1; lonOffset <= 1; lonOffset += 1) {
      const key = `${latKey + latOffset}:${lonKey + lonOffset}`;
      const matches = grid.get(key);
      if (matches) results.push(...matches);
    }
  }
  return results;
}

function inferLargeAreaCandidate(candidate) {
  return (
    candidate.coordinateSource === "representative_area_bbox_center" ||
    candidate.osmType === "relation" ||
    largeAreaTypes.has(candidate.photoAtlasType) ||
    candidate.tags?.boundary === "protected_area" ||
    candidate.tags?.leisure === "nature_reserve"
  );
}

function buildClassification(candidate, familyByType) {
  const tags = candidate.tags ?? {};
  const photoAtlasType = familyByType.has(candidate.photoAtlasType) ? candidate.photoAtlasType : "other";
  const photoAtlasFamily = familyByType.get(photoAtlasType) ?? "other";
  const reasons = [];
  let confidence = "LOW";

  if (photoAtlasType !== "other") {
    reasons.push(`Type ${photoAtlasType} issu de l'extraction`);
  } else {
    reasons.push("Type other issu de l'extraction");
  }

  if (strongSignalTypes.has(photoAtlasType)) {
    confidence = "HIGH";
    reasons.push("Type fortement signalé");
  } else if (!genericTypes.has(photoAtlasType) && photoAtlasType !== "other") {
    confidence = "MEDIUM";
    reasons.push("Type spécialisé mais moins discriminant");
  }

  if (photoAtlasType === "lighthouse") {
    if (/\bfeu\b/i.test(candidate.name ?? "") || tags["seamark:type"] === "light_minor") {
      confidence = "MEDIUM";
      reasons.push("Signal phare à distinguer d'un feu maritime technique");
    } else {
      reasons.push("Phare identifié avec signal fort");
    }
  }

  if (photoAtlasType === "bridge") {
    confidence = "LOW";
    reasons.push("Pont soumis à un filtrage sévère");
  }

  if (photoAtlasType === "other") {
    confidence = hasAnyTag(tags, ["wikidata", "wikipedia", "heritage", "ref:mhs", "description", "website"])
      ? "MEDIUM"
      : "LOW";
  }

  if (photoAtlasType === "beach" || photoAtlasType === "harbour" || photoAtlasType === "pier" || photoAtlasType === "quay") {
    confidence = confidence === "HIGH" ? "HIGH" : "MEDIUM";
    reasons.push("Type soumis à vérification contextuelle");
  }

  if (candidate.name && confidence === "LOW" && photoAtlasType !== "other") {
    confidence = "MEDIUM";
  }

  return { photoAtlasType, photoAtlasFamily, confidence, classificationReasons: [...new Set(reasons)] };
}

function collectDistinctiveSignals(candidate, classification, neighbors) {
  const tags = candidate.tags ?? {};
  const name = `${candidate.name ?? ""} ${candidate.nameFr ?? ""} ${candidate.officialName ?? ""}`.trim();
  const description = `${tags.description ?? ""} ${tags.note ?? ""} ${tags["short_description"] ?? ""}`.trim();
  const signals = [];

  if (tags.heritage || tags["ref:mhs"] || tags["ref:FR:INPN"] || tags.designation || tags.protect_class) {
    signals.push("protected_or_heritage_status");
  }

  if (tags.wikidata && tags.wikipedia) {
    signals.push("cross_documented_landmark");
  }

  if (tags["seamark:type"] || tags["tower:type"] || tags.height || tags.ele || tags.historic || tags.boundary || tags.leisure) {
    signals.push("specific_structural_descriptor");
  }

  if (
    /observatoire|observatory|belv[eé]d[eè]re|panorama|dune|phare|fort|ch[aâ]teau|ruine|cascade|cascad|plage|baie|r[eé]serve|ornith|bird|marais|jet[eé]e|viaduc|pont/i.test(
      `${name} ${description}`,
    )
  ) {
    signals.push("explicit_thematic_context");
  }

  if (hasAnyTag(tags, ["image", "wikimedia_commons", "website"])) {
    signals.push("visual_documentation");
  }

  if (
    (classification.photoAtlasType === "lighthouse" && tags["seamark:type"]) ||
    (classification.photoAtlasType === "observatory" && /observatoire|observatory/i.test(`${name} ${description}`)) ||
    (classification.photoAtlasType === "bird_reserve" && /ornith|bird|oiseaux|avifaune/i.test(`${name} ${description}`)) ||
    (classification.photoAtlasType === "dune" && /dune/i.test(name)) ||
    (classification.photoAtlasType === "bay" && /baie|anse/i.test(name)) ||
    (classification.photoAtlasType === "bridge" && /viaduc|pont/i.test(name))
  ) {
    signals.push("type_specific_identity");
  }

  const elevation = parseNumericTag(tags.ele);
  if (classification.photoAtlasType === "summit" && elevation !== null && elevation >= 150) {
    signals.push("high_elevation_peak");
  }

  const scenicNearby = neighbors.some((other) => {
    if (other.placeKey === candidate.placeKey) return false;
    if (!Number.isFinite(other.latitude) || !Number.isFinite(other.longitude)) return false;
    if (distanceMeters(candidate, other) > 2500) return false;
    return [
      "lighthouse",
      "sea_cliff",
      "beach",
      "bay",
      "viewpoint",
      "observatory",
      "waterfall",
      "dune",
      "nature_reserve",
      "bird_reserve",
    ].includes(other.photoAtlasType);
  });
  if (scenicNearby) signals.push("scenic_context_nearby");

  return [...new Set(signals)];
}

function hasStrongDistinctiveSignal(signals) {
  return signals.some((signal) => [
    "protected_or_heritage_status",
    "cross_documented_landmark",
    "specific_structural_descriptor",
    "explicit_thematic_context",
    "high_elevation_peak",
    "scenic_context_nearby",
    "visual_documentation",
    "type_specific_identity",
  ].includes(signal));
}

function evaluateDistinctDestination(candidate, classification, distinctiveSignals) {
  const tags = candidate.tags ?? {};
  const reasons = [];
  const hasName = Boolean(candidate.name ?? candidate.nameFr ?? candidate.officialName);
  const hasCoordinates = Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude);
  const hasDocumentation = hasAnyTag(tags, ["wikidata", "wikipedia", "description", "website", "heritage", "ref:mhs", "ref:FR:INPN"]);
  const thematic = distinctiveSignals.includes("explicit_thematic_context") || distinctiveSignals.includes("type_specific_identity");
  const scenic = distinctiveSignals.includes("scenic_context_nearby");
  const protectedSignal = distinctiveSignals.includes("protected_or_heritage_status");
  const structural = distinctiveSignals.includes("specific_structural_descriptor");
  const largeArea = inferLargeAreaCandidate(candidate);

  if (!hasName) reasons.push("Nom absent");
  if (!hasCoordinates) reasons.push("Coordonnées invalides");
  if (!classification.photoAtlasType) reasons.push("Type PhotoAtlas absent");
  if (!hasName || !hasCoordinates || !classification.photoAtlasType) {
    return { eligible: false, reasons };
  }

  if (classification.photoAtlasType === "bridge" && !(/viaduc/i.test(candidate.name ?? "") || hasDocumentation || protectedSignal || structural)) {
    reasons.push("Pont sans signal patrimonial, documentaire ou contextuel suffisant");
    return { eligible: false, reasons };
  }

  if (classification.photoAtlasType === "other" && !hasDocumentation && !protectedSignal && !thematic) {
    reasons.push("Type other sans signal suffisamment discriminant");
    return { eligible: false, reasons };
  }

  if (candidate.principalTag === "tourism=artwork" && !hasDocumentation && !thematic) {
    reasons.push("Œuvre sans signal de reconnaissance ou de contexte suffisant");
    return { eligible: false, reasons };
  }

  if (candidate.principalTag === "historic=archaeological_site" && !hasDocumentation && !protectedSignal) {
    reasons.push("Site archéologique sans signal patrimonial ou documentaire suffisant");
    return { eligible: false, reasons };
  }

  if (classification.photoAtlasType === "beach" && !hasDocumentation && !thematic && !scenic) {
    reasons.push("Plage générique sans contexte distinctif explicite");
    return { eligible: false, reasons };
  }

  if (classification.photoAtlasType === "viewpoint" && !thematic && !scenic && !hasDocumentation) {
    reasons.push("Point de vue sans panorama ou documentation explicite");
    return { eligible: false, reasons };
  }

  if (classification.photoAtlasType === "lighthouse" && (/\bfeu\b/i.test(candidate.name ?? "") || tags["seamark:type"] === "light_minor") && !hasDocumentation && !protectedSignal) {
    reasons.push("Signal de feu maritime technique sans justification Premium suffisante");
    return { eligible: false, reasons };
  }

  if (largeArea && !thematic && !protectedSignal && !scenic) {
    reasons.push("Grande zone sans destination identifiable suffisamment caractérisée");
    return { eligible: false, reasons };
  }

  reasons.push("Lieu physiquement identifiable et distinct");
  return { eligible: true, reasons };
}

function evaluateRemarkable(candidate, classification, distinctiveSignals) {
  const tags = candidate.tags ?? {};
  const reasons = [];
  const signals = [];
  let score = 0;

  if (candidate.name) {
    score += 10;
    reasons.push("Lieu nommé");
  }

  if (classification.confidence === "HIGH") {
    score += 10;
    signals.push("high_classification_confidence");
  } else if (classification.confidence === "MEDIUM") {
    score += 6;
    signals.push("medium_classification_confidence");
  }

  const documentationSignalCount = Number(Boolean(tags.wikidata)) + Number(Boolean(tags.wikipedia));
  if (documentationSignalCount >= 2) {
    score += 16;
    signals.push("cross_documented_landmark");
    reasons.push("Documentation croisée Wikidata/Wikipedia");
  } else if (documentationSignalCount === 1) {
    score += 8;
    reasons.push("Documentation externe partielle");
  }

  const protectionSignalCount = [tags.heritage, tags["ref:mhs"], tags["ref:FR:INPN"], tags.designation, tags.protect_class]
    .filter(Boolean)
    .length;
  if (protectionSignalCount >= 2) {
    score += 18;
    signals.push("protected_or_heritage_status");
    reasons.push("Signal patrimonial ou de protection fort");
  } else if (protectionSignalCount === 1) {
    score += 10;
    signals.push("protected_or_heritage_status");
    reasons.push("Signal patrimonial ou de protection présent");
  }

  if (tags.official_name || tags.description || tags.website) {
    score += 8;
    signals.push("descriptive_context");
    reasons.push("Contexte descriptif ou institutionnel présent");
  }

  if (distinctiveSignals.includes("type_specific_identity")) {
    score += 12;
    signals.push("type_specific_identity");
    reasons.push("Identité explicite du lieu");
  }

  if (distinctiveSignals.includes("high_elevation_peak")) {
    score += 10;
    signals.push("high_elevation_peak");
    reasons.push("Sommet avec altitude notable");
  }

  if (distinctiveSignals.includes("specific_structural_descriptor")) {
    score += 8;
  }

  if (candidate.principalTag === "historic=archaeological_site" && hasAnyTag(tags, ["wikidata", "wikipedia", "heritage", "ref:mhs"])) {
    score += 8;
    reasons.push("Site archéologique documenté");
  }

  score = clamp(score, 0, 100);
  const eligible = score >= remarkableThreshold && (hasStrongDistinctiveSignal(distinctiveSignals) || protectionSignalCount > 0);
  if (!eligible) reasons.push("Caractère remarquable insuffisamment établi par les données");
  return { eligible, score, signals: [...new Set(signals)], reasons: [...new Set(reasons)] };
}

function evaluatePhotographic(candidate, classification, distinctiveSignals) {
  const tags = candidate.tags ?? {};
  const name = `${candidate.name ?? ""} ${candidate.nameFr ?? ""} ${candidate.officialName ?? ""}`.trim();
  const description = `${tags.description ?? ""}`;
  const scenicNearby = distinctiveSignals.includes("scenic_context_nearby");
  const largeArea = inferLargeAreaCandidate(candidate);
  const reasons = [];
  const signals = [];
  let score = Math.round((scoreByType[classification.photoAtlasType] ?? scoreByType.other) * 0.5);

  if (strongSignalTypes.has(classification.photoAtlasType)) score += 4;
  if (candidate.coordinateSource === "node") score += 8;
  else if (candidate.coordinateSource === "representative_way_bbox_center") score += 6;
  else score += 4;

  if (!largeArea) score += 4;

  if (distinctiveSignals.includes("specific_structural_descriptor")) {
    score += 12;
    signals.push("specific_structural_descriptor");
  }

  if (distinctiveSignals.includes("explicit_thematic_context")) {
    score += 12;
    signals.push("explicit_thematic_context");
  }

  if (scenicNearby) {
    score += 14;
    signals.push("scenic_context_nearby");
    reasons.push("Contexte paysager cohérent à proximité");
  }

  if (distinctiveSignals.includes("visual_documentation")) {
    score += 4;
    signals.push("visual_documentation");
  }

  if (classification.photoAtlasType === "lighthouse" && (tags["seamark:type"] || tags.height)) {
    score += 10;
    reasons.push("Phare structurellement caractérisé");
  }

  if (classification.photoAtlasType === "viewpoint" && /panorama|belv[eé]d[eè]re|vue/i.test(`${name} ${description}`)) {
    score += 10;
    reasons.push("Panorama ou point de vue explicitement caractérisé");
  }

  if (classification.photoAtlasType === "beach" && /anse|pointe|grande plage|plage de|plage du/i.test(name)) {
    score += 8;
    reasons.push("Plage individualisée par son nom");
  }

  if (classification.photoAtlasType === "bridge" && /viaduc/i.test(name)) {
    score += 10;
    reasons.push("Viaduc explicitement individualisé");
  }

  if (classification.photoAtlasType === "observatory" && /observatoire|observatory|panorama|vue/i.test(`${name} ${description}`)) {
    score += 14;
    reasons.push("Fonction d'observation explicitement démontrée");
  }

  if (classification.photoAtlasType === "bird_reserve" && /ornith|bird|oiseaux|avifaune/i.test(`${name} ${description}`)) {
    score += 16;
    reasons.push("Vocation d'observation ornithologique explicite");
  }

  if (candidate.principalTag === "tourism=artwork") {
    score -= 14;
    reasons.push("Œuvre nécessitant une reconnaissance documentaire supplémentaire");
  }

  if (candidate.principalTag === "historic=archaeological_site") {
    score -= 10;
    reasons.push("Site archéologique nécessitant des signaux distinctifs supplémentaires");
  }

  if (genericTypes.has(classification.photoAtlasType)) {
    score -= 12;
    reasons.push("Type PhotoAtlas générique ou bruyant");
  }

  if (largeArea) {
    score -= 12;
    reasons.push("Grande zone : le point représentatif n'est pas nécessairement un point photo");
  }

  if (candidate.principalTag === "tourism=attraction") score -= 12;
  if (candidate.principalTag === "tourism=artwork") score -= 8;
  if (candidate.principalTag === "bridge=yes") score -= 18;
  if (candidate.principalTag === "natural=beach") score -= 8;
  if (!candidate.name) score -= 10;

  score = clamp(score, 0, 100);
  const eligible = score >= photographicThreshold && (signals.length > 0 || scenicNearby);
  if (!eligible) reasons.push("Intérêt photographique insuffisamment démontré par les données");
  return { eligible, score, signals: [...new Set(signals)], reasons: [...new Set(reasons)] };
}

function computeScores(candidate, classification, neighbors) {
  const distinctiveSignals = collectDistinctiveSignals(candidate, classification, neighbors);
  const destination = evaluateDistinctDestination(candidate, classification, distinctiveSignals);
  const remarkable = evaluateRemarkable(candidate, classification, distinctiveSignals);
  const photographic = evaluatePhotographic(candidate, classification, distinctiveSignals);
  const distinctiveSignalEligible = hasStrongDistinctiveSignal(distinctiveSignals);
  const baseRankingScore = Math.round(
    clamp(
      remarkable.score * 0.45 + photographic.score * 0.55 - Math.max(0, Math.abs(remarkable.score - photographic.score) - 35) * 0.2,
      0,
      100,
    ),
  );

  const eligible =
    destination.eligible &&
    remarkable.eligible &&
    photographic.eligible &&
    distinctiveSignalEligible &&
    classification.confidence !== "LOW" &&
    Boolean(candidate.name ?? candidate.nameFr ?? candidate.officialName) &&
    Number.isFinite(candidate.latitude) &&
    Number.isFinite(candidate.longitude);

  const premiumScore = eligible
    ? clamp(80 + Math.round(Math.max(0, baseRankingScore - 55) * 0.5), 80, 100)
    : clamp(baseRankingScore, 0, 79);

  const reasons = [
    ...new Set([
      ...classification.classificationReasons,
      ...destination.reasons,
      ...remarkable.reasons,
      ...photographic.reasons,
      distinctiveSignalEligible
        ? "Au moins un signal distinctif au-delà du type est présent"
        : "Aucun signal distinctif suffisamment discriminant au-delà du type",
    ]),
  ];

  return {
    remarkableScore: remarkable.score,
    photographicScore: photographic.score,
    premiumScore,
    distinctiveSignals,
    isDistinctDestination: destination.eligible,
    remarkableEligible: remarkable.eligible,
    photographicEligible: photographic.eligible,
    distinctiveSignalEligible,
    baseRankingScore,
    reasons,
  };
}

function dedupeThresholdMeters(item) {
  if (item.largeAreaCandidate) return 3000;
  if (["bay", "beach", "forest", "wetland", "nature_reserve", "bird_reserve", "harbour"].includes(item.photoAtlasType)) return 2500;
  if (["pier", "lighthouse", "observatory", "viewpoint", "bridge"].includes(item.photoAtlasType)) return 600;
  return 400;
}

function shouldGroupPlaces(a, b) {
  if (a.photoAtlasType !== b.photoAtlasType) return false;
  const aName = normalizeName(a.name ?? a.nameFr ?? a.officialName ?? null);
  const bName = normalizeName(b.name ?? b.nameFr ?? b.officialName ?? null);
  const sameName = aName && bName && aName === bName;
  const sameDocKey = documentaryKey(a) && documentaryKey(a) === documentaryKey(b);
  const exactCoord = a.latitude === b.latitude && a.longitude === b.longitude;
  if (!(sameName || sameDocKey || exactCoord)) return false;
  if (!Number.isFinite(a.latitude) || !Number.isFinite(a.longitude) || !Number.isFinite(b.latitude) || !Number.isFinite(b.longitude)) {
    return sameName || sameDocKey || exactCoord;
  }
  return distanceMeters(a, b) <= Math.max(dedupeThresholdMeters(a), dedupeThresholdMeters(b)) || sameDocKey || exactCoord;
}

function choosePrimaryRepresentation(group) {
  return [...group].sort((a, b) => {
    const statusDelta = statusRank(b.qualificationStatus) - statusRank(a.qualificationStatus);
    if (statusDelta !== 0) return statusDelta;
    const scoreDelta = b.premiumScore - a.premiumScore;
    if (scoreDelta !== 0) return scoreDelta;
    const confidenceDelta = confidenceRank(b.confidence) - confidenceRank(a.confidence);
    if (confidenceDelta !== 0) return confidenceDelta;
    return (a.name ?? "").localeCompare(b.name ?? "", "fr");
  })[0] ?? null;
}

function deduplicateQualifiedSpots(items) {
  const groups = [];
  for (const item of items) {
    let matched = null;
    for (const group of groups) {
      if (group.some((existing) => shouldGroupPlaces(existing, item))) {
        matched = group;
        break;
      }
    }
    if (matched) matched.push(item);
    else groups.push([item]);
  }

  const spots = groups.map((group) => {
    const primary = choosePrimaryRepresentation(group);
    const mergedReasons = {
      premiumReasons: [...new Set(group.flatMap((item) => item.premiumReasons))].slice(0, 10),
      reviewReasons: [...new Set(group.flatMap((item) => item.reviewReasons))].slice(0, 10),
      rejectionReasons: [...new Set(group.flatMap((item) => item.rejectionReasons))].slice(0, 10),
    };
    return {
      placeKey: primary.placeKey,
      name: primary.name,
      latitude: primary.latitude,
      longitude: primary.longitude,
      photoAtlasType: primary.photoAtlasType,
      photoAtlasFamily: primary.photoAtlasFamily,
      premiumScore: primary.premiumScore,
      remarkableScore: primary.remarkableScore,
      photographicScore: primary.photographicScore,
      confidence: primary.confidence,
      qualificationStatus: primary.qualificationStatus,
      premiumReasons: primary.qualificationStatus === "premium" ? mergedReasons.premiumReasons : [],
      reviewReasons: primary.qualificationStatus === "review" ? mergedReasons.reviewReasons : [],
      rejectionReasons: primary.qualificationStatus === "rejected" ? mergedReasons.rejectionReasons : [],
      principalTag: primary.principalTag,
      tags: primary.tags,
      duplicateCount: group.length,
      osmRepresentations: group
        .sort((a, b) => statusRank(b.qualificationStatus) - statusRank(a.qualificationStatus) || b.premiumScore - a.premiumScore)
        .map((item, index) => ({
          osmType: item.osmType,
          osmId: item.osmId,
          sourceExternalId: item.sourceExternalId,
          principalTag: item.principalTag,
          coordinateSource: item.coordinateSource,
          photoAtlasType: item.photoAtlasType,
          qualificationStatus: item.qualificationStatus,
          premiumScore: item.premiumScore,
          confidence: item.confidence,
          isPrimary: index === 0,
        })),
    };
  }).sort((a, b) => statusRank(b.qualificationStatus) - statusRank(a.qualificationStatus) || b.premiumScore - a.premiumScore || (a.name ?? "").localeCompare(b.name ?? "", "fr"));

  return { groups, spots };
}

function countBy(items, selector) {
  const counts = {};
  for (const item of items) {
    const key = selector(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1]));
}

function countByStatus(items, matcher) {
  const counts = { candidates: 0, premium: 0, review: 0, rejected: 0 };
  for (const item of items) {
    if (!matcher(item)) continue;
    counts.candidates += 1;
    counts[item.qualificationStatus] += 1;
  }
  return counts;
}

function summarizeScores(items) {
  const remarkableScores = items.map((item) => item.remarkableScore);
  const photographicScores = items.map((item) => item.photographicScore);
  const premiumScores = items.map((item) => item.premiumScore);
  return {
    remarkableScore: {
      min: Math.min(...remarkableScores),
      max: Math.max(...remarkableScores),
      average: round(mean(remarkableScores)),
      median: round(median(remarkableScores)),
    },
    photographicScore: {
      min: Math.min(...photographicScores),
      max: Math.max(...photographicScores),
      average: round(mean(photographicScores)),
      median: round(median(photographicScores)),
    },
    premiumScore: {
      min: Math.min(...premiumScores),
      max: Math.max(...premiumScores),
      average: round(mean(premiumScores)),
      median: round(median(premiumScores)),
    },
  };
}

function topTable(items, limit, reasonField) {
  return items.slice(0, limit).map((item, index) => {
    const reasons = (item[reasonField] ?? []).slice(0, 2).join(" ; ");
    return `| ${index + 1} | ${item.name ?? "(sans nom)"} | ${item.photoAtlasType} | ${item.premiumScore} | ${item.remarkableScore} | ${item.photographicScore} | ${item.confidence} | ${reasons} |`;
  });
}

function reviewTable(items, limit) {
  return items.slice(0, limit).map((item) => `| ${item.name ?? "(sans nom)"} | ${item.photoAtlasType} | ${item.premiumScore} | ${(item.reviewReasons ?? []).slice(0, 2).join(" ; ")} |`);
}

function formatCountPercent(count, total) {
  const percent = total === 0 ? 0 : (count / total) * 100;
  return `${count} (${percent.toFixed(2)} %)`;
}

const referenceContent = await readFile(referenceSql, "utf8");
const { validTypes, familyByType } = parseReferenceTypes(referenceContent);

const sourceCandidates = [];
const jsonlReader = createInterface({ input: createReadStream(inputJsonl, "utf8"), crlfDelay: Infinity });
for await (const line of jsonlReader) {
  if (!line.trim()) continue;
  sourceCandidates.push(JSON.parse(line));
}

const normalizedCandidates = sourceCandidates.map((candidate) => ({
  ...candidate,
  photoAtlasType: validTypes.has(candidate.photoAtlasType) ? candidate.photoAtlasType : "other",
  photoAtlasFamily: familyByType.get(validTypes.has(candidate.photoAtlasType) ? candidate.photoAtlasType : "other") ?? "other",
  sourceExternalId: candidate.sourceExternalId ?? `osm:${candidate.osmType}/${candidate.osmId}`,
}));

const spatialIndex = buildSpatialIndex(normalizedCandidates);

const qualifiedCandidates = [];
const validation = {
  invalidTypes: 0,
  invalidFamilies: 0,
  invalidCoordinates: 0,
  duplicatePlaceKeys: 0,
  nullScores: 0,
  outOfRangeScores: 0,
};

const placeKeys = new Set();

for (const candidate of normalizedCandidates) {
  const classification = buildClassification(candidate, familyByType);
  const neighbors = nearbyCandidates(candidate, spatialIndex);
  const score = computeScores(candidate, classification, neighbors);

  const premiumEligible =
    classification.photoAtlasType &&
    classification.confidence !== "LOW" &&
    score.isDistinctDestination &&
    score.remarkableEligible &&
    score.photographicEligible &&
    score.distinctiveSignalEligible &&
    score.premiumScore >= premiumThreshold &&
    Boolean(candidate.name ?? candidate.nameFr ?? candidate.officialName) &&
    Number.isFinite(candidate.latitude) &&
    Number.isFinite(candidate.longitude);

  const nearThreshold =
    score.baseRankingScore >= reviewHeuristic.baseRankingScore ||
    score.remarkableScore >= reviewHeuristic.remarkableScore ||
    score.photographicScore >= reviewHeuristic.photographicScore;

  const reviewEligible = !premiumEligible && Boolean(classification.photoAtlasType) && nearThreshold;
  const qualificationStatus = premiumEligible ? "premium" : reviewEligible ? "review" : "rejected";

  const missingConditions = [
    !score.isDistinctDestination ? "destination identifiable insuffisamment démontrée" : null,
    !score.remarkableEligible ? "caractère remarquable insuffisamment établi" : null,
    !score.photographicEligible ? "potentiel photographique insuffisamment établi" : null,
    !score.distinctiveSignalEligible ? "absence de signal distinctif discriminant" : null,
    classification.confidence === "LOW" ? "confiance de typage limitée" : null,
    score.premiumScore < premiumThreshold ? `premiumScore < ${premiumThreshold}` : null,
  ].filter(Boolean);

  const premiumReasons = qualificationStatus === "premium" ? score.reasons.slice(0, 10) : [];
  const reviewReasons = qualificationStatus === "review"
    ? [...new Set([
      ...score.reasons.filter((reason) => !reason.includes("insuffisamment")),
      "Les données disponibles ne permettent pas encore de justifier Premium",
      ...missingConditions,
    ])].slice(0, 10)
    : [];
  const rejectionReasons = qualificationStatus === "rejected"
    ? [...new Set([
      ...missingConditions,
      ...score.reasons.filter((reason) => reason.includes("insuffisamment") || reason.includes("générique") || reason.includes("technique")),
      "Les données disponibles ne permettent pas de justifier Premium",
    ])].slice(0, 10)
    : [];

  const qualified = {
    placeKey: candidate.placeKey,
    name: candidate.name,
    nameFr: candidate.nameFr,
    officialName: candidate.officialName,
    latitude: round(candidate.latitude),
    longitude: round(candidate.longitude),
    osmType: candidate.osmType,
    osmId: candidate.osmId,
    sourceExternalId: candidate.sourceExternalId,
    principalTag: candidate.principalTag,
    photoAtlasType: classification.photoAtlasType,
    photoAtlasFamily: classification.photoAtlasFamily,
    premiumScore: score.premiumScore,
    remarkableScore: score.remarkableScore,
    photographicScore: score.photographicScore,
    confidence: classification.confidence,
    qualificationStatus,
    premiumReasons,
    reviewReasons,
    rejectionReasons,
    tags: candidate.tags,
    coordinateSource: candidate.coordinateSource,
    largeAreaCandidate: inferLargeAreaCandidate(candidate),
    distinctiveSignals: score.distinctiveSignals,
    osmRepresentations: candidate.osmRepresentations ?? [
      {
        osmType: candidate.osmType,
        osmId: candidate.osmId,
        sourceExternalId: candidate.sourceExternalId,
        principalTag: candidate.principalTag,
        coordinateSource: candidate.coordinateSource,
        isPrimary: true,
      },
    ],
  };

  if (!validTypes.has(qualified.photoAtlasType)) validation.invalidTypes += 1;
  if ((familyByType.get(qualified.photoAtlasType) ?? "other") !== qualified.photoAtlasFamily) validation.invalidFamilies += 1;
  if (!Number.isFinite(qualified.latitude) || !Number.isFinite(qualified.longitude) || Math.abs(qualified.latitude) > 90 || Math.abs(qualified.longitude) > 180) validation.invalidCoordinates += 1;
  if (placeKeys.has(qualified.placeKey)) validation.duplicatePlaceKeys += 1;
  placeKeys.add(qualified.placeKey);

  for (const scoreValue of [qualified.premiumScore, qualified.remarkableScore, qualified.photographicScore]) {
    if (!Number.isFinite(scoreValue)) validation.nullScores += 1;
    if (scoreValue < 0 || scoreValue > 100) validation.outOfRangeScores += 1;
  }

  qualifiedCandidates.push(qualified);
}

const deduplication = deduplicateQualifiedSpots(qualifiedCandidates);
const spots = deduplication.spots;
const premiumSpots = spots.filter((item) => item.qualificationStatus === "premium");
const reviewSpots = spots.filter((item) => item.qualificationStatus === "review");
const rejectedSpots = spots.filter((item) => item.qualificationStatus === "rejected");
const candidateStatusCounts = countBy(qualifiedCandidates, (item) => item.qualificationStatus);
const spotStatusCounts = countBy(spots, (item) => item.qualificationStatus);

const typeCounts = countBy(spots, (item) => item.photoAtlasType);
const familyCounts = countBy(spots, (item) => item.photoAtlasFamily);
const principalTagCounts = countBy(spots, (item) => item.principalTag ?? "unknown");
const confidenceCounts = countBy(spots, (item) => item.confidence);
const premiumScoreBuckets = countBy(spots, (item) => scoreBucket(item.premiumScore));
const remarkableScoreBuckets = countBy(spots, (item) => scoreBucket(item.remarkableScore));
const photographicScoreBuckets = countBy(spots, (item) => scoreBucket(item.photographicScore));

const dominantTypeAnalysis = {
  bridge: countByStatus(spots, (item) => item.photoAtlasType === "bridge"),
  other: countByStatus(spots, (item) => item.photoAtlasType === "other"),
  beach: countByStatus(spots, (item) => item.photoAtlasType === "beach"),
  castle: countByStatus(spots, (item) => item.photoAtlasType === "castle"),
  pier: countByStatus(spots, (item) => item.photoAtlasType === "pier"),
  bay: countByStatus(spots, (item) => item.photoAtlasType === "bay"),
  ruins: countByStatus(spots, (item) => item.photoAtlasType === "ruins"),
  viewpoint: countByStatus(spots, (item) => item.photoAtlasType === "viewpoint"),
  lighthouse: countByStatus(spots, (item) => item.photoAtlasType === "lighthouse"),
  archaeological_site: countByStatus(spots, (item) => item.principalTag === "historic=archaeological_site"),
  artwork: countByStatus(spots, (item) => item.principalTag === "tourism=artwork"),
};

const rejectedReasonCounts = countBy(rejectedSpots.flatMap((item) => item.rejectionReasons).map((reason) => ({ reason })), (item) => item.reason);
const duplicateGroups = deduplication.groups.filter((group) => group.length > 1);

const falsePositiveCandidates = Object.entries(dominantTypeAnalysis)
  .map(([key, counts]) => ({
    key,
    ...counts,
    premiumRate: counts.candidates === 0 ? 0 : counts.premium / counts.candidates,
  }))
  .filter((item) => item.candidates >= 10 && item.premiumRate >= 0.15)
  .sort((a, b) => b.premiumRate - a.premiumRate);

const falseNegativeCandidates = spots
  .filter((item) => item.qualificationStatus !== "premium")
  .filter((item) => {
    const reasonPool = [...item.reviewReasons, ...item.rejectionReasons].join(" ");
    return (
      item.remarkableScore >= remarkableThreshold &&
      item.photographicScore >= photographicThreshold - 5 &&
      (item.tags?.wikidata || item.tags?.wikipedia || item.tags?.heritage || item.tags?.["ref:mhs"] || item.tags?.designation) &&
      /premiumScore < 80|confiance de typage limitée|potentiel photographique insuffisamment établi|caractère remarquable insuffisamment établi/i.test(reasonPool)
    );
  })
  .sort((a, b) => b.premiumScore - a.premiumScore)
  .slice(0, 25);

const scoreSummary = summarizeScores(spots);
const scoreByStatus = {
  premium: summarizeScores(premiumSpots.length > 0 ? premiumSpots : [{ remarkableScore: 0, photographicScore: 0, premiumScore: 0 }]),
  review: summarizeScores(reviewSpots.length > 0 ? reviewSpots : [{ remarkableScore: 0, photographicScore: 0, premiumScore: 0 }]),
  rejected: summarizeScores(rejectedSpots.length > 0 ? rejectedSpots : [{ remarkableScore: 0, photographicScore: 0, premiumScore: 0 }]),
};

let aquitaineComparison = null;
if (existsSync(aquitaineStatsPath) && existsSync(aquitaineReviewPath)) {
  const aquitaineStats = JSON.parse(await readFile(aquitaineStatsPath, "utf8"));
  const aquitaineReview = JSON.parse(await readFile(aquitaineReviewPath, "utf8"));
  aquitaineComparison = {
    candidates: aquitaineStats.before,
    premium: aquitaineStats.premium,
    review: aquitaineReview.length,
    rejected: aquitaineStats.before - aquitaineStats.premium - aquitaineReview.length,
    dominantPremiumTypes: aquitaineStats.premiumByType,
  };
}

const quality = {
  pass: Object.values(validation).every((value) => value === 0),
  validation,
  thresholds: {
    remarkableThreshold,
    photographicThreshold,
    premiumThreshold,
    reviewHeuristic,
  },
  deduplication: {
    inputCandidates: qualifiedCandidates.length,
    outputSpots: spots.length,
    groupsMerged: duplicateGroups.length,
    mergedRepresentations: duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0),
  },
};

const output = {
  version: 1,
  region,
  status: "qualification",
  spots: spots.map((item) => ({
    placeKey: item.placeKey,
    name: item.name,
    latitude: item.latitude,
    longitude: item.longitude,
    photoAtlasType: item.photoAtlasType,
    photoAtlasFamily: item.photoAtlasFamily,
    premiumScore: item.premiumScore,
    remarkableScore: item.remarkableScore,
    photographicScore: item.photographicScore,
    confidence: item.confidence,
    qualificationStatus: item.qualificationStatus,
    premiumReasons: item.premiumReasons,
    reviewReasons: item.reviewReasons,
    rejectionReasons: item.rejectionReasons,
    osmRepresentations: item.osmRepresentations,
  })),
};

const stats = {
  version: 1,
  region,
  source: inputJsonl,
  generatedAt: new Date().toISOString(),
  thresholds: {
    remarkableThreshold,
    photographicThreshold,
    premiumThreshold,
    reviewHeuristic,
  },
  totalCandidates: normalizedCandidates.length,
  outputSpots: spots.length,
  premium: candidateStatusCounts.premium ?? 0,
  review: candidateStatusCounts.review ?? 0,
  rejected: candidateStatusCounts.rejected ?? 0,
  spotStatusCounts,
  byPhotoAtlasType: typeCounts,
  byPhotoAtlasFamily: familyCounts,
  byPrincipalTag: principalTagCounts,
  byConfidence: confidenceCounts,
  byStatus: candidateStatusCounts,
  scoreBuckets: {
    premiumScore: premiumScoreBuckets,
    remarkableScore: remarkableScoreBuckets,
    photographicScore: photographicScoreBuckets,
  },
  scoreSummary,
  scoreByStatus,
  dominantTypeAnalysis,
  rejectedReasonCounts,
  topPremium: premiumSpots.slice(0, 50).map((item) => ({
    name: item.name,
    type: item.photoAtlasType,
    premiumScore: item.premiumScore,
    remarkableScore: item.remarkableScore,
    photographicScore: item.photographicScore,
    confidence: item.confidence,
    reasons: item.premiumReasons,
  })),
  topReview: reviewSpots.slice(0, 100).map((item) => ({
    name: item.name,
    type: item.photoAtlasType,
    score: item.premiumScore,
    reasons: item.reviewReasons,
  })),
  falsePositiveCandidates,
  falseNegativeCandidates: falseNegativeCandidates.map((item) => ({
    name: item.name,
    type: item.photoAtlasType,
    premiumScore: item.premiumScore,
    remarkableScore: item.remarkableScore,
    photographicScore: item.photographicScore,
    confidence: item.confidence,
    qualificationStatus: item.qualificationStatus,
    reasons: item.qualificationStatus === "review" ? item.reviewReasons : item.rejectionReasons,
  })),
  duplicates: {
    groups: duplicateGroups.length,
    examples: duplicateGroups.slice(0, 20).map((group) => group.map((item) => ({
      placeKey: item.placeKey,
      name: item.name,
      type: item.photoAtlasType,
      status: item.qualificationStatus,
      score: item.premiumScore,
    }))),
  },
  quality,
  comparisonAquitaine: aquitaineComparison,
};

const dominantTypeRows = Object.entries(dominantTypeAnalysis)
  .map(([type, counts]) => `| ${type} | ${counts.candidates} | ${counts.premium} | ${counts.review} | ${counts.rejected} |`)
  .join("\n");

const topPremiumRows = topTable(premiumSpots, 50, "premiumReasons").join("\n");
const topReviewRows = reviewTable(reviewSpots, 100).join("\n");
const rejectedReasonRows = Object.entries(rejectedReasonCounts)
  .slice(0, 20)
  .map(([reason, count]) => `| ${reason} | ${count} |`)
  .join("\n");
const suspiciousRows = falsePositiveCandidates.length === 0
  ? "Aucun surcroît Premium évident dans les catégories surveillées."
  : falsePositiveCandidates.map((item) => `- ${item.key}: ${item.premium}/${item.candidates} Premium (${(item.premiumRate * 100).toFixed(2)} %)`).join("\n");
const falseNegativeRows = falseNegativeCandidates.length === 0
  ? "Aucun cas prioritaire détecté."
  : falseNegativeCandidates.map((item) => `- ${item.name} (${item.photoAtlasType}) score ${item.premiumScore}, statut ${item.qualificationStatus}`).join("\n");
const comparisonTable = aquitaineComparison
  ? `| Indicateur | Aquitaine | Bretagne |\n|---|---:|---:|\n| Candidats | ${aquitaineComparison.candidates} | ${normalizedCandidates.length} |\n| Premium | ${aquitaineComparison.premium} | ${candidateStatusCounts.premium ?? 0} |\n| Review | ${aquitaineComparison.review} | ${candidateStatusCounts.review ?? 0} |\n| Rejected | ${aquitaineComparison.rejected} | ${candidateStatusCounts.rejected ?? 0} |`
  : "Comparaison Aquitaine indisponible.";
const aquitaineTopTypes = aquitaineComparison
  ? Object.entries(aquitaineComparison.dominantPremiumTypes)
    .slice(0, 10)
    .map(([type, count]) => `- Aquitaine Premium ${type}: ${count}`)
    .join("\n")
  : "";

const qaReport = `# Qualification Bretagne\n\n## Volume\n\n- Candidats source: ${normalizedCandidates.length}\n- Premium candidats: ${formatCountPercent(candidateStatusCounts.premium ?? 0, normalizedCandidates.length)}\n- Review candidats: ${formatCountPercent(candidateStatusCounts.review ?? 0, normalizedCandidates.length)}\n- Rejected candidats: ${formatCountPercent(candidateStatusCounts.rejected ?? 0, normalizedCandidates.length)}\n- Spots après déduplication: ${spots.length}\n- Premium spots: ${formatCountPercent(premiumSpots.length, spots.length)}\n- Review spots: ${formatCountPercent(reviewSpots.length, spots.length)}\n- Rejected spots: ${formatCountPercent(rejectedSpots.length, spots.length)}\n\n## Premium\n\n- Score Premium min/max/moyenne/médiane: ${scoreByStatus.premium.premiumScore.min} / ${scoreByStatus.premium.premiumScore.max} / ${scoreByStatus.premium.premiumScore.average} / ${scoreByStatus.premium.premiumScore.median}\n- Confiance: ${JSON.stringify(countBy(premiumSpots, (item) => item.confidence))}\n\n## Review\n\n- Heuristique reprise du pipeline Aquitaine: baseRankingScore >= ${reviewHeuristic.baseRankingScore} ou remarkable >= ${reviewHeuristic.remarkableScore} ou photographic >= ${reviewHeuristic.photographicScore}\n- Volume candidats: ${candidateStatusCounts.review ?? 0}\n- Volume spots: ${reviewSpots.length}\n\n## Rejected\n\n- Volume candidats: ${candidateStatusCounts.rejected ?? 0}\n- Volume spots: ${rejectedSpots.length}\n- Raisons dominantes:\n\n| Raison | Nombre |\n|---|---:|\n${rejectedReasonRows || "| Aucune | 0 |"}\n\n## Types dominants\n\n| Type / catégorie | Candidats | Premium | Review | Rejected |\n|---|---:|---:|---:|---:|\n${dominantTypeRows}\n\n## Familles\n\n${Object.entries(familyCounts).map(([family, count]) => `- ${family}: ${count}`).join("\n")}\n\n## Scores\n\n- PremiumScore: min ${scoreSummary.premiumScore.min}, max ${scoreSummary.premiumScore.max}, moyenne ${scoreSummary.premiumScore.average}, médiane ${scoreSummary.premiumScore.median}\n- RemarkableScore: min ${scoreSummary.remarkableScore.min}, max ${scoreSummary.remarkableScore.max}, moyenne ${scoreSummary.remarkableScore.average}, médiane ${scoreSummary.remarkableScore.median}\n- PhotographicScore: min ${scoreSummary.photographicScore.min}, max ${scoreSummary.photographicScore.max}, moyenne ${scoreSummary.photographicScore.average}, médiane ${scoreSummary.photographicScore.median}\n\n## Doublons\n\n- Groupes fusionnés: ${duplicateGroups.length}\n- Représentations fusionnées: ${duplicateGroups.reduce((sum, group) => sum + group.length - 1, 0)}\n\n## Cas suspects\n\n### Faux positifs potentiels\n\n${suspiciousRows}\n\n### À surveiller lors de la revue humaine\n\n${falseNegativeRows}\n\n## Top 50 Premium\n\n| Rang | Spot | Type | Score Premium | Remarquable | Photo | Confiance | Raisons |\n|---:|---|---|---:|---:|---:|---|---|\n${topPremiumRows || ""}\n\n## Review prioritaire\n\n| Spot | Type | Score | Raison |\n|---|---|---:|---|\n${topReviewRows || ""}\n\n## Comparaison Aquitaine\n\n${comparisonTable}\n\n${aquitaineTopTypes}\n\n## Qualité\n\n- Validation technique: ${quality.pass ? "PASS" : "FAIL"}\n- Types invalides: ${validation.invalidTypes}\n- Familles invalides: ${validation.invalidFamilies}\n- Coordonnées invalides: ${validation.invalidCoordinates}\n- placeKey dupliqués: ${validation.duplicatePlaceKeys}\n- Scores nuls inattendus: ${validation.nullScores}\n- Scores hors intervalle: ${validation.outOfRangeScores}\n`;

await writeFile(outputJson, `${JSON.stringify(output, null, 2)}\n`, "utf8");
await writeFile(outputStats, `${JSON.stringify(stats, null, 2)}\n`, "utf8");
await writeFile(outputQa, `${qaReport}\n`, "utf8");

if (!quality.pass) {
  console.error(JSON.stringify({ quality, outputJson, outputStats, outputQa }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  region,
  source: inputJsonl,
  totalCandidates: normalizedCandidates.length,
  outputSpots: spots.length,
  premium: candidateStatusCounts.premium ?? 0,
  review: candidateStatusCounts.review ?? 0,
  rejected: candidateStatusCounts.rejected ?? 0,
  premiumRate: round(((candidateStatusCounts.premium ?? 0) / Math.max(normalizedCandidates.length, 1)) * 100),
  outputJson,
  outputStats,
  outputQa,
  qualityPass: quality.pass,
}, null, 2));