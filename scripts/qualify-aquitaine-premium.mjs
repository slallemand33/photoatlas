import { createReadStream } from "node:fs";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createInterface } from "node:readline";

const root = process.cwd();
const inputJsonl = resolve(root, "data/osm/aquitaine-photo-candidates.jsonl");
const outputPremium = resolve(root, "data/osm/photoatlas-premium-aquitaine.json");
const outputPremiumDeduplicated = resolve(root, "data/osm/photoatlas-premium-aquitaine-deduplicated.json");
const outputStats = resolve(root, "data/osm/photoatlas-premium-aquitaine.stats.json");
const bassinPilotFile = resolve(root, "data/spots/bassin-arcachon-pilot.json");

if (!existsSync(inputJsonl)) {
  console.error(`Fichier candidats introuvable: ${inputJsonl}`);
  process.exit(1);
}

const typeToFamily = {
  beach: "Littoral",
  dune: "Littoral",
  sandbank: "Littoral",
  sea_cliff: "Littoral",
  rocky_coast: "Littoral",
  bay: "Littoral",
  estuary: "Littoral",
  coastal_marsh: "Littoral",
  harbour: "Maritime",
  oyster_harbour: "Maritime",
  pier: "Maritime",
  quay: "Maritime",
  ponton: "Maritime",
  lighthouse: "Maritime",
  lock: "Maritime",
  forest: "Nature",
  lake: "Nature",
  pond: "Nature",
  river: "Nature",
  waterfall: "Nature",
  wetland: "Nature",
  nature_reserve: "Nature",
  bird_reserve: "Nature",
  countryside: "Nature",
  mountain: "Relief",
  summit: "Relief",
  mountain_pass: "Relief",
  valley: "Relief",
  gorge: "Relief",
  plateau: "Relief",
  viewpoint: "Relief",
  castle: "Architecture",
  religious_building: "Architecture",
  abbey: "Architecture",
  fortification: "Architecture",
  ruins: "Architecture",
  monument: "Architecture",
  bridge: "Architecture",
  village: "Architecture",
  modern_architecture: "Architecture",
  industrial_architecture: "Architecture",
  observatory: "Observation",
  dark_sky_site: "Observation",
  wildlife_site: "Faune",
  animal_colony: "Faune",
  wildlife_park: "Faune",
  mill: "Structures",
  quarry: "Structures",
  dam: "Structures",
  wind_farm: "Structures",
  infrastructure: "Structures",
};

const highPriorityTypes = new Set([
  "dune",
  "sandbank",
  "sea_cliff",
  "rocky_coast",
  "lighthouse",
  "waterfall",
  "gorge",
  "peak",
  "summit",
  "mountain_pass",
  "viewpoint",
  "castle",
  "ruins",
  "fortification",
  "monument",
  "observatory",
  "dark_sky_site",
  "nature_reserve",
  "bird_reserve",
  "wildlife_site",
  "animal_colony",
  "pier",
  "oyster_harbour",
  "harbour",
  "dam",
  "mill",
  "quarry",
]);

const genericTypes = new Set([
  "beach",
  "forest",
  "river",
  "lake",
  "pond",
  "wetland",
  "village",
  "religious_building",
  "bridge",
  "harbour",
  "countryside",
  "infrastructure",
]);

const genericPrincipalTags = new Set([
  "tourism=attraction",
  "tourism=information",
  "natural=water",
  "place=village",
  "natural=forest",
  "natural=beach",
]);

const photographicPriorityTypes = new Set([
  "dune",
  "sandbank",
  "sea_cliff",
  "rocky_coast",
  "lighthouse",
  "waterfall",
  "gorge",
  "summit",
  "mountain_pass",
  "viewpoint",
  "observatory",
  "dark_sky_site",
  "bird_reserve",
  "nature_reserve",
  "pier",
  "oyster_harbour",
  "harbour",
]);

const photographyInterestByType = {
  dune: 29,
  sandbank: 27,
  sea_cliff: 27,
  rocky_coast: 25,
  bay: 22,
  estuary: 22,
  coastal_marsh: 20,
  lighthouse: 28,
  pier: 25,
  quay: 18,
  ponton: 18,
  harbour: 18,
  oyster_harbour: 24,
  lock: 15,
  forest: 8,
  lake: 14,
  pond: 11,
  river: 10,
  waterfall: 28,
  wetland: 12,
  nature_reserve: 20,
  bird_reserve: 23,
  countryside: 10,
  mountain: 23,
  summit: 28,
  mountain_pass: 25,
  valley: 16,
  gorge: 27,
  plateau: 15,
  viewpoint: 26,
  castle: 12,
  religious_building: 11,
  abbey: 22,
  fortification: 20,
  ruins: 22,
  monument: 14,
  bridge: 12,
  village: 11,
  modern_architecture: 14,
  industrial_architecture: 18,
  observatory: 24,
  dark_sky_site: 26,
  wildlife_site: 20,
  animal_colony: 22,
  wildlife_park: 8,
  mill: 22,
  quarry: 22,
  dam: 18,
  wind_farm: 16,
  infrastructure: 8,
};

const bassinCurrentType = new Map(
  JSON.parse(await readFile(bassinPilotFile, "utf8")).map((spot) => [spot.name, spot.spot_type]),
);

const bassinExpectedTypes = new Map([
  ["Dune du Pilat", "dune"],
  ["Banc d'Arguin", "sandbank"],
  ["Port de Larros", "harbour"],
  ["Port ostréicole de La Teste", "oyster_harbour"],
  ["Jetée d'Andernos", "pier"],
  ["Jetée Bélisaire", "pier"],
  ["Phare du Cap-Ferret", "lighthouse"],
  ["Plage du Moulleau", "beach"],
  ["Réserve ornithologique du Teich", "bird_reserve"],
  ["Observatoire Sainte-Cécile", "observatory"],
]);

const remarkableThreshold = 40;
const photographicThreshold = 50;
const premiumThreshold = 80;

const strongDistinctiveSignalKeys = new Set([
  "protected_or_heritage_status",
  "cross_documented_landmark",
  "specific_structural_descriptor",
  "explicit_thematic_context",
  "high_elevation_peak",
  "scenic_context_nearby",
  "visual_documentation",
  "type_specific_identity",
]);

function normalizeName(name) {
  return (name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesReferenceSpot(candidateName, targetName) {
  const normalizedCandidate = normalizeName(candidateName);
  const normalizedTarget = normalizeName(targetName);
  if (!normalizedCandidate || !normalizedTarget) return false;
  if (normalizedCandidate === normalizedTarget) return true;
  if (targetName === "Jetée Bélisaire") {
    return normalizedCandidate === normalizeName("Jetée de Bélisaire");
  }
  return false;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value) {
  return Math.round(value * 100) / 100;
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

function nearAnyTag(candidate, nearbyCandidates, predicate, maxDistanceMeters) {
  if (candidate.latitude === null || candidate.longitude === null) return false;
  for (const other of nearbyCandidates) {
    if (other.osmType === candidate.osmType && other.osmId === candidate.osmId) continue;
    if (other.latitude === null || other.longitude === null) continue;
    if (distanceMeters(candidate, other) > maxDistanceMeters) continue;
    if (predicate(other)) return true;
  }
  return false;
}

function hasAnyTag(tags, keys) {
  return keys.some((key) => Boolean(tags[key]));
}

function parseNumericTag(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value !== "string") return null;
  const normalized = value.replace(/,/g, ".").match(/-?\d+(?:\.\d+)?/);
  if (!normalized) return null;
  const parsed = Number(normalized[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

function collectDistinctiveSignals(candidate, classification, nearbyCandidates) {
  const name = candidate.name ?? candidate.nameFr ?? candidate.officialName ?? "";
  const tags = candidate.tags ?? {};
  const description = `${tags.description ?? ""} ${tags.note ?? ""} ${tags["short_description"] ?? ""}`.trim();
  const signals = [];

  const hasProtectionSignal = Boolean(
    tags.heritage ||
      tags["ref:mhs"] ||
      tags["ref:FR:INPN"] ||
      /national|nationale|class[eé]|inscrit|monument historique/i.test(`${tags.protection_title ?? ""} ${description}`),
  );
  if (hasProtectionSignal) signals.push("protected_or_heritage_status");

  if (tags.wikidata && tags.wikipedia) signals.push("cross_documented_landmark");

  if (
    tags.landform ||
    tags["tower:type"] === "observation" ||
    tags["seamark:type"] ||
    tags["seamark:harbour:category"] ||
    tags.height ||
    tags.ele
  ) {
    signals.push("specific_structural_descriptor");
  }

  if (
    /ornith|bird|avifaune|oyster|ostr[eé]icole|observatoire|observatory|panorama|belv[eé]d[eè]re|belvedere|dune|banc|cascade|gorge|jet[eé]e|phare/i.test(
      `${name} ${description}`,
    )
  ) {
    signals.push("explicit_thematic_context");
  }

  const elevation = parseNumericTag(tags.ele);
  if (classification.photoAtlasType === "summit" && elevation !== null && elevation >= 1500) {
    signals.push("high_elevation_peak");
  }

  const scenicNearby = nearAnyTag(
    candidate,
    nearbyCandidates,
    (other) =>
      [
        "natural=coastline",
        "natural=cliff",
        "natural=beach",
        "natural=dune",
        "natural=bay",
        "natural=peak",
        "waterway=waterfall",
        "tourism=viewpoint",
        "man_made=lighthouse",
        "man_made=pier",
      ].includes(other.principalTag),
    2500,
  );
  if (scenicNearby) signals.push("scenic_context_nearby");

  if (hasAnyTag(tags, ["image", "wikimedia_commons"])) signals.push("visual_documentation");

  if (
    (classification.photoAtlasType === "oyster_harbour" && /ostr[eé]icole|oyster/i.test(`${name} ${description}`)) ||
    (classification.photoAtlasType === "bird_reserve" && /ornith|bird|avifaune|oiseaux/i.test(`${name} ${description}`)) ||
    (classification.photoAtlasType === "observatory" && /observatoire|observatory/i.test(`${name} ${description}`)) ||
    (classification.photoAtlasType === "dune" && (/dune/i.test(name) || Boolean(tags.landform))) ||
    (classification.photoAtlasType === "sandbank" && /banc|arguin|sand|sable/i.test(name)) ||
    (classification.photoAtlasType === "lighthouse" && Boolean(tags["seamark:type"]))
  ) {
    signals.push("type_specific_identity");
  }

  return [...new Set(signals)];
}

function hasStrongDistinctiveSignal(signals) {
  return signals.some((signal) => strongDistinctiveSignalKeys.has(signal));
}

function evaluateDistinctDestination(candidate, classification, distinctiveSignals) {
  const reasons = [];
  const hasName = Boolean(candidate.name ?? candidate.nameFr ?? candidate.officialName);
  const hasCoordinates = Number.isFinite(candidate.latitude) && Number.isFinite(candidate.longitude);

  if (!hasName) reasons.push("Nom absent");
  if (!hasCoordinates) reasons.push("Coordonnées invalides");
  if (!classification.photoAtlasType) reasons.push("Type PhotoAtlas non plausible");

  if (!hasName || !hasCoordinates || !classification.photoAtlasType) {
    return { eligible: false, reasons };
  }

  const hasStructuralSignal = distinctiveSignals.includes("specific_structural_descriptor");
  const hasThematicSignal = distinctiveSignals.includes("explicit_thematic_context") || distinctiveSignals.includes("type_specific_identity");
  const hasLandscapeSignal = distinctiveSignals.includes("scenic_context_nearby");
  const hasProtectedSignal = distinctiveSignals.includes("protected_or_heritage_status");

  if (candidate.principalTag === "tourism=information" && !hasThematicSignal && !hasLandscapeSignal) {
    reasons.push("Point d'information sans ancrage photographique distinct");
    return { eligible: false, reasons };
  }

  if (["natural=water", "place=village", "amenity=place_of_worship"].includes(candidate.principalTag) && !hasThematicSignal && !hasProtectedSignal) {
    reasons.push("Objet générique sans ancrage de destination distinct");
    return { eligible: false, reasons };
  }

  if (candidate.large_area_candidate) {
    const eligibleLargeArea = ["bird_reserve", "nature_reserve", "dune", "sandbank"].includes(classification.photoAtlasType);
    if (!eligibleLargeArea) {
      reasons.push("Grande zone sans destination photographique clairement démontrée");
      return { eligible: false, reasons };
    }
    if (!hasThematicSignal && !hasProtectedSignal) {
      reasons.push("Grande zone sans signal d'usage photographique ou d'observation explicite");
      return { eligible: false, reasons };
    }
  }

  if (["pier", "harbour", "oyster_harbour", "quay", "ponton"].includes(classification.photoAtlasType) && !hasThematicSignal && !hasStructuralSignal && !hasLandscapeSignal) {
    reasons.push("Infrastructure maritime nommée mais non démontrée comme destination distincte");
    return { eligible: false, reasons };
  }

  if (["summit", "viewpoint"].includes(classification.photoAtlasType) && !hasLandscapeSignal && !distinctiveSignals.includes("high_elevation_peak") && !distinctiveSignals.includes("cross_documented_landmark")) {
    reasons.push("Relief ou point de vue sans signal distinctif supplémentaire");
    return { eligible: false, reasons };
  }

  return {
    eligible: true,
    reasons: ["Lieu physiquement identifiable et distinct"],
  };
}

function classify(candidate) {
  const tags = candidate.tags ?? {};
  const name = candidate.name ?? candidate.nameFr ?? candidate.officialName ?? null;
  const natural = tags.natural ?? null;
  const tourism = tags.tourism ?? null;
  const manMade = tags.man_made ?? null;
  const historic = tags.historic ?? null;
  const leisure = tags.leisure ?? null;
  const amenity = tags.amenity ?? null;
  const boundary = tags.boundary ?? null;
  const power = tags.power ?? null;
  const water = tags.water ?? null;
  const generatorSource = tags["generator:source"] ?? null;
  const description = `${tags.description ?? ""} ${tags.note ?? ""} ${tags["short_description"] ?? ""}`.trim();

  let photoAtlasType = null;
  let confidence = "LOW";
  const reasons = [];

  if (natural === "dune") {
    photoAtlasType = "dune";
    confidence = "HIGH";
    reasons.push("Type dune identifié directement");
  } else if (natural === "cliff") {
    photoAtlasType = "sea_cliff";
    confidence = "HIGH";
    reasons.push("Falaise identifiée directement");
  } else if (natural === "bay") {
    photoAtlasType = "bay";
    confidence = "HIGH";
    reasons.push("Baie identifiée directement");
  } else if (natural === "coastline") {
    if (/banc|arguin|sand|sable/i.test(name ?? "")) {
      photoAtlasType = "sandbank";
      confidence = hasAnyTag(tags, ["wikidata", "wikipedia", "name:fr"]) ? "HIGH" : "MEDIUM";
      reasons.push("Littoral nommé évoquant un banc de sable");
    } else if (/falaise|cliff/i.test(name ?? "")) {
      photoAtlasType = "sea_cliff";
      confidence = "MEDIUM";
      reasons.push("Littoral nommé évoquant une falaise");
    } else {
      photoAtlasType = null;
      confidence = "LOW";
      reasons.push("Tracé de côte trop générique");
    }
  } else if (natural === "peak") {
    photoAtlasType = /dune/i.test(name ?? "") ? "dune" : "summit";
    confidence = /dune/i.test(name ?? "") ? "MEDIUM" : "HIGH";
    reasons.push(/dune/i.test(name ?? "") ? "Point haut nommé associé à une dune" : "Sommet identifié");
  } else if (natural === "valley") {
    photoAtlasType = "valley";
    confidence = "MEDIUM";
    reasons.push("Vallée identifiée");
  } else if (natural === "gorge") {
    photoAtlasType = "gorge";
    confidence = "HIGH";
    reasons.push("Gorge identifiée");
  } else if (natural === "plateau") {
    photoAtlasType = "plateau";
    confidence = "MEDIUM";
    reasons.push("Plateau identifié");
  } else if (natural === "wetland") {
    if (/ornith|bird|oiseaux|faune/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "bird_reserve";
      confidence = "MEDIUM";
      reasons.push("Zone humide associée à l'observation des oiseaux");
    } else if (/marais|marsh|prés salé|pres sale/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "coastal_marsh";
      confidence = "MEDIUM";
      reasons.push("Zone humide nommée évoquant un marais photo identifiable");
    } else {
      photoAtlasType = "wetland";
      confidence = "LOW";
      reasons.push("Zone humide trop générique sans signal remarquable");
    }
  } else if (natural === "water") {
    if (water === "lake" || /\blac\b/i.test(name ?? "")) {
      photoAtlasType = "lake";
      confidence = "MEDIUM";
      reasons.push("Plan d'eau nommé de type lac");
    } else if (water === "pond" || /\b(etang|étang)\b/i.test(name ?? "")) {
      photoAtlasType = "pond";
      confidence = "MEDIUM";
      reasons.push("Plan d'eau nommé de type étang");
    } else if (/estuaire|estuary/i.test(name ?? "")) {
      photoAtlasType = "estuary";
      confidence = "MEDIUM";
      reasons.push("Plan d'eau nommé comme estuaire");
    } else {
      photoAtlasType = null;
      confidence = "LOW";
      reasons.push("Plan d'eau générique sans caractère photographique établi");
    }
  } else if (natural === "beach") {
    photoAtlasType = "beach";
    confidence = name ? "MEDIUM" : "LOW";
    reasons.push(name ? "Plage nommée" : "Plage générique non nommée");
  } else if (natural === "forest") {
    photoAtlasType = "forest";
    confidence = "LOW";
    reasons.push("Forêt trop générique à ce stade");
  } else if (tourism === "viewpoint") {
    if (/dune/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "dune";
      confidence = "MEDIUM";
      reasons.push("Point de vue nommé directement associé à une dune");
    } else {
      photoAtlasType = "viewpoint";
      confidence = name ? "HIGH" : "MEDIUM";
      reasons.push(name ? "Point de vue nommé" : "Point de vue sans nom remarquable");
    }
  } else if (tourism === "observatory" || manMade === "observatory") {
    photoAtlasType = hasAnyTag(tags, ["astronomy", "dark_sky"]) ? "dark_sky_site" : "observatory";
    confidence = name ? "HIGH" : "MEDIUM";
    reasons.push("Site d'observation identifié");
  } else if ((manMade === "tower" || tags["tower:type"] === "observation") && /observatoire|observatory/i.test(`${name ?? ""} ${description}`)) {
    photoAtlasType = "observatory";
    confidence = name ? "HIGH" : "MEDIUM";
    reasons.push("Tour d'observation nommée comme observatoire");
  } else if ((manMade === "tower" || tags["tower:type"] === "observation") && tourism === "viewpoint") {
    photoAtlasType = "viewpoint";
    confidence = name ? "MEDIUM" : "LOW";
    reasons.push("Tour d'observation utilisée comme point de vue");
  } else if (tourism === "information") {
    if (tags.viewpoint === "yes" || /observatoire|belvédère|belvedere|point de vue/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "viewpoint";
      confidence = "MEDIUM";
      reasons.push("Information touristique associée à un point de vue");
    } else {
      photoAtlasType = null;
      confidence = "LOW";
      reasons.push("Information touristique générique");
    }
  } else if (tourism === "attraction") {
    if (historic === "castle" || tags.building === "castle") {
      photoAtlasType = "castle";
      confidence = "MEDIUM";
      reasons.push("Attraction associée à un château");
    } else if (manMade === "observatory") {
      photoAtlasType = "observatory";
      confidence = "MEDIUM";
      reasons.push("Attraction associée à un observatoire");
    } else {
      photoAtlasType = null;
      confidence = "LOW";
      reasons.push("Attraction trop générique sans type remarquable clair");
    }
  } else if (manMade === "lighthouse") {
    photoAtlasType = "lighthouse";
    confidence = "HIGH";
    reasons.push("Phare identifié directement");
  } else if (manMade === "pier") {
    photoAtlasType = "pier";
    confidence = "HIGH";
    reasons.push("Jetée identifiée directement");
  } else if (manMade === "breakwater") {
    photoAtlasType = "quay";
    confidence = "MEDIUM";
    reasons.push("Ouvrage maritime identifié");
  } else if (manMade === "quay") {
    photoAtlasType = "quay";
    confidence = "HIGH";
    reasons.push("Quai identifié directement");
  } else if (leisure === "marina" || tags.harbour) {
    if (/ostr[eé]icole|oyster/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "oyster_harbour";
      confidence = "HIGH";
      reasons.push("Port ostréicole explicitement identifié");
    } else {
      photoAtlasType = "harbour";
      confidence = name ? "MEDIUM" : "LOW";
      reasons.push(name ? "Port ou marina nommé" : "Port générique sans nom distinctif");
    }
  } else if (leisure === "nature_reserve" || boundary === "protected_area") {
    if (/ornith|bird/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "bird_reserve";
      confidence = "HIGH";
      reasons.push("Réserve nommée à vocation ornithologique");
    } else if (/faune|animal|oiseaux|bird/i.test(`${name ?? ""} ${description}`)) {
      photoAtlasType = "wildlife_site";
      confidence = "MEDIUM";
      reasons.push("Zone protégée orientée faune");
    } else {
      photoAtlasType = "nature_reserve";
      confidence = name ? "MEDIUM" : "LOW";
      reasons.push(name ? "Réserve naturelle nommée" : "Zone protégée trop générique");
    }
  } else if (historic === "castle" || tags.building === "castle") {
    photoAtlasType = "castle";
    confidence = hasAnyTag(tags, ["heritage", "wikidata", "wikipedia", "ref:mhs"]) ? "HIGH" : "MEDIUM";
    reasons.push("Château identifié");
  } else if (historic === "ruins") {
    photoAtlasType = "ruins";
    confidence = "HIGH";
    reasons.push("Ruines identifiées");
  } else if (historic === "monument") {
    photoAtlasType = "monument";
    confidence = "MEDIUM";
    reasons.push("Monument identifié");
  } else if (historic === "archaeological_site") {
    photoAtlasType = "ruins";
    confidence = "MEDIUM";
    reasons.push("Site archéologique rapproché de ruines remarquables");
  } else if (historic === "bridge" || manMade === "bridge") {
    photoAtlasType = "bridge";
    confidence = "MEDIUM";
    reasons.push("Pont identifié");
  } else if (amenity === "place_of_worship" || /church|chapel|cathedral|temple|mosque|synagogue|monastery/.test(tags.building ?? "")) {
    if (/abbaye|abbey|monast[eè]re/i.test(`${name ?? ""} ${description}`) || tags.building === "monastery") {
      photoAtlasType = "abbey";
      confidence = "MEDIUM";
      reasons.push("Édifice religieux assimilable à une abbaye");
    } else {
      photoAtlasType = "religious_building";
      confidence = name ? "MEDIUM" : "LOW";
      reasons.push(name ? "Édifice religieux nommé" : "Édifice religieux ordinaire");
    }
  } else if (tags.astronomy) {
    photoAtlasType = "dark_sky_site";
    confidence = "MEDIUM";
    reasons.push("Tag astronomy présent");
  } else if (manMade === "mill" || manMade === "windmill" || /moulin/i.test(name ?? "")) {
    photoAtlasType = "mill";
    confidence = name ? "MEDIUM" : "LOW";
    reasons.push("Moulin identifié");
  } else if (manMade === "dam" || tags.waterway === "dam") {
    photoAtlasType = "dam";
    confidence = "MEDIUM";
    reasons.push("Barrage identifié");
  } else if (power === "generator" && generatorSource === "wind") {
    photoAtlasType = "wind_farm";
    confidence = name ? "MEDIUM" : "LOW";
    reasons.push("Équipement éolien identifié");
  } else if (tags.waterway === "waterfall") {
    photoAtlasType = "waterfall";
    confidence = "HIGH";
    reasons.push("Cascade identifiée directement");
  } else if (tags.place === "village") {
    photoAtlasType = "village";
    confidence = hasAnyTag(tags, ["wikidata", "wikipedia", "heritage", "official_name"]) ? "MEDIUM" : "LOW";
    reasons.push(confidence === "MEDIUM" ? "Village nommé avec signaux patrimoniaux ou documentaires" : "Village générique");
  }

  const photoAtlasFamily = photoAtlasType ? typeToFamily[photoAtlasType] ?? null : null;
  if (!photoAtlasType) {
    reasons.push("Aucune classification PhotoAtlas plausible retenue");
  }

  return { photoAtlasType, photoAtlasFamily, confidence, classificationReasons: reasons };
}

function evaluateRemarkable(candidate, classification, distinctiveSignals) {
  const tags = candidate.tags ?? {};
  const name = candidate.name ?? candidate.nameFr ?? candidate.officialName ?? null;
  const reasons = [];
  const signals = [];
  let score = 0;

  if (name) {
    score += 10;
    signals.push("named_place");
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

  const protectionSignalCount = [tags.heritage, tags["ref:mhs"], tags["ref:FR:INPN"], tags.protection_title]
    .filter(Boolean).length;
  if (protectionSignalCount >= 2) {
    score += 18;
    signals.push("protected_or_heritage_status");
    reasons.push("Signal patrimonial ou de protection fort");
  } else if (protectionSignalCount === 1) {
    score += 10;
    signals.push("protected_or_heritage_status");
    reasons.push("Signal patrimonial ou de protection présent");
  }

  if (tags.official_name || tags.description || tags["short_description"] || tags.website) {
    score += 8;
    signals.push("descriptive_context");
    reasons.push("Contexte descriptif ou institutionnel présent");
  }

  if (distinctiveSignals.includes("type_specific_identity")) {
    score += 12;
    signals.push("type_specific_identity");
    reasons.push("Identité métier explicite du lieu");
  }

  if (["sandbank", "oyster_harbour", "bird_reserve", "observatory", "dune", "lighthouse"].includes(classification.photoAtlasType) && distinctiveSignals.includes("type_specific_identity")) {
    score += 8;
  }

  if (distinctiveSignals.includes("high_elevation_peak")) {
    score += 10;
    signals.push("high_elevation_peak");
    reasons.push("Sommet avec altitude significative");
  }

  if (distinctiveSignals.includes("specific_structural_descriptor")) {
    score += 8;
  }

  score = clamp(score, 0, 100);
  const eligible = score >= remarkableThreshold && (hasStrongDistinctiveSignal(distinctiveSignals) || protectionSignalCount > 0);
  if (!eligible) reasons.push("Caractère remarquable insuffisamment établi par les données");

  return { eligible, score, signals: [...new Set(signals)], reasons: [...new Set(reasons)] };
}

function evaluatePhotographic(candidate, classification, distinctiveSignals, _nearbyCandidates) {
  const tags = candidate.tags ?? {};
  const name = candidate.name ?? candidate.nameFr ?? candidate.officialName ?? "";
  const reasons = [];
  const signals = [];
  const scenicNearby = distinctiveSignals.includes("scenic_context_nearby");
  const elevation = parseNumericTag(tags.ele);
  let score = Math.round((photographyInterestByType[classification.photoAtlasType] ?? 0) * 0.5);

  if (classification.photoAtlasType && photographicPriorityTypes.has(classification.photoAtlasType)) {
    score += 4;
  }

  if (candidate.coordinateSource === "node") score += 8;
  else if (candidate.coordinateSource === "representative_way_geometry") score += 6;
  else score += 4;

  if (!candidate.large_area_candidate) score += 4;

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
    reasons.push("Contexte paysager ou photogénique cohérent à proximité");
  }

  if (distinctiveSignals.includes("visual_documentation")) {
    score += 4;
    signals.push("visual_documentation");
  }

  if (classification.photoAtlasType === "summit") {
    if (elevation !== null && elevation >= 1500) {
      score += 12;
      signals.push("high_elevation_peak");
      reasons.push("Altitude significative pour un sommet");
    } else if (elevation !== null && elevation >= 800) {
      score += 6;
      reasons.push("Altitude notable mais modérée");
    }
  }

  if (classification.photoAtlasType === "lighthouse" && (tags["seamark:type"] || tags.height || tags["seamark:landmark:height"])) {
    score += 10;
    reasons.push("Phare structurellement caractérisé");
  }

  if (classification.photoAtlasType === "pier" && /promenade|balade|vue|paysage|panorama/i.test(`${tags.description ?? ""} ${name}`)) {
    score += 8;
    reasons.push("Jetée avec usage paysager ou promenade explicite");
  }

  if (classification.photoAtlasType === "oyster_harbour" && /ostr[eé]icole|oyster/i.test(`${name} ${tags.description ?? ""}`)) {
    score += 12;
    reasons.push("Port ostréicole explicitement caractérisé");
  }

  if (classification.photoAtlasType === "sandbank" && /banc|arguin|sand|sable/i.test(name)) {
    score += 14;
    reasons.push("Banc de sable explicitement individualisé");
  }

  if (classification.photoAtlasType === "bird_reserve") {
    if (/observatoire|bird_hide|ornith|bird|oiseaux|avifaune/i.test(`${name} ${tags.description ?? ""} ${tags.leisure ?? ""}`)) {
      score += 16;
      reasons.push("Vocation d'observation ornithologique explicite");
    }
  }

  if (classification.photoAtlasType === "observatory") {
    if (tags["tower:type"] === "observation" || /observatoire|observatory|panorama|vue/i.test(`${name} ${tags.description ?? ""}`)) {
      score += 14;
      reasons.push("Fonction d'observation explicitement démontrée");
    }
  }

  if (classification.photoAtlasType === "dune" && (/dune/i.test(name) || tags.landform)) {
    score += 10;
  }

  if (["ruins", "castle"].includes(classification.photoAtlasType)) {
    if (/fort|citadelle|donjon|tour|tower|towerhouse|ruine|grotte|dolmen|menhir/i.test(`${name} ${tags.castle_type ?? ""} ${tags["tower:type"] ?? ""} ${tags.building ?? ""}`)) {
      score += 10;
      reasons.push("Expression visuelle identifiable de la structure patrimoniale");
    }
    if (distinctiveSignals.includes("visual_documentation")) {
      score += 6;
    }
  }

  const genericTag = genericPrincipalTags.has(candidate.principalTag) || candidate.generic_tourism_candidate;
  if (genericTag) {
    score -= 18;
    reasons.push("Tag OSM générique nécessitant un ancrage photographique supplémentaire");
  }
  if (genericTypes.has(classification.photoAtlasType)) {
    score -= 12;
    reasons.push("Type PhotoAtlas générique");
  }
  if (candidate.large_area_candidate) {
    const largeAreaPenalty = ["bird_reserve", "nature_reserve"].includes(classification.photoAtlasType) && distinctiveSignals.includes("explicit_thematic_context") ? 0 : 12;
    score -= largeAreaPenalty;
    reasons.push("Grande zone : le point représentatif n'est pas nécessairement un point photo");
  }
  if (candidate.principalTag === "tourism=information") score -= 18;
  if (candidate.principalTag === "tourism=attraction") score -= 12;
  if (candidate.principalTag === "natural=water") score -= 16;
  if (candidate.principalTag === "place=village") score -= 16;
  if (candidate.principalTag === "amenity=place_of_worship") score -= 14;
  if (!name) score -= 10;

  score = clamp(score, 0, 100);
  const eligible = score >= photographicThreshold && (signals.length > 0 || scenicNearby);
  if (!eligible) reasons.push("Intérêt photographique insuffisamment démontré par les données");

  return { eligible, score, signals: [...new Set(signals)], reasons: [...new Set(reasons)] };
}

function computeScores(candidate, classification, nearbyCandidates) {
  const distinctiveSignals = collectDistinctiveSignals(candidate, classification, nearbyCandidates);
  const destination = evaluateDistinctDestination(candidate, classification, distinctiveSignals);
  const remarkable = evaluateRemarkable(candidate, classification, distinctiveSignals);
  const photographic = evaluatePhotographic(candidate, classification, distinctiveSignals, nearbyCandidates);

  const distinctiveSignalEligible = hasStrongDistinctiveSignal(distinctiveSignals);
  const distinctiveSignalReasons = distinctiveSignalEligible
    ? ["Au moins un signal distinctif au-delà du type est présent"]
    : ["Aucun signal distinctif suffisamment discriminant au-delà du type"];

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

  const eligibilityReasons = [
    ...new Set([
      ...classification.classificationReasons,
      ...destination.reasons,
      ...remarkable.reasons,
      ...photographic.reasons,
      ...distinctiveSignalReasons,
    ]),
  ];

  return {
    remarkableScore: remarkable.score,
    photographicScore: photographic.score,
    premiumScore,
    distinctiveSignals,
    isDistinctDestination: destination.eligible,
    destinationReasons: destination.reasons,
    remarkableEligible: remarkable.eligible,
    remarkableSignals: remarkable.signals,
    photographicEligible: photographic.eligible,
    photographicSignals: photographic.signals,
    distinctiveSignalEligible,
    baseRankingScore,
    premiumReasons: eligibilityReasons.slice(0, 10),
  };
}

function representationPriority(item) {
  const type = item.photoAtlasType;
  const priorities = {
    dune: 100,
    sandbank: 95,
    lighthouse: 90,
    bird_reserve: 88,
    observatory: 86,
    oyster_harbour: 84,
    harbour: 82,
    pier: 80,
    viewpoint: 70,
    beach: 60,
  };
  return priorities[type] ?? 40;
}

function representationObjectPriority(item) {
  if (item.principalTag === "natural=dune") return 100;
  if (item.principalTag === "man_made=lighthouse") return 95;
  if (item.principalTag === "leisure=nature_reserve") return 90;
  if (item.principalTag === "man_made=pier") return 90;
  if (item.principalTag === "leisure=marina") return 88;
  if (item.principalTag === "tower:type=observation") return 86;
  if (item.principalTag === "tourism=viewpoint") return 80;
  if (item.principalTag === "natural=peak") return 70;
  return 50;
}

function chooseBestReferenceRepresentation(name, matches) {
  const expectedType = bassinExpectedTypes.get(name) ?? null;
  const sorted = [...matches].sort((a, b) => {
    const expectedDelta = (b.photoAtlasType === expectedType) - (a.photoAtlasType === expectedType);
    if (expectedDelta !== 0) return expectedDelta;
    const premiumDelta = Number(b.premium) - Number(a.premium);
    if (premiumDelta !== 0) return premiumDelta;
    const objectDelta = representationObjectPriority(b) - representationObjectPriority(a);
    if (objectDelta !== 0) return objectDelta;
    const typeDelta = representationPriority(b) - representationPriority(a);
    if (typeDelta !== 0) return typeDelta;
    return b.premiumScore - a.premiumScore;
  });
  return sorted[0] ?? null;
}

function documentaryKey(item) {
  return item.osmTags.wikidata ?? item.osmTags.wikipedia ?? item.osmTags["ref:mhs"] ?? item.osmTags["ref:FR:INPN"] ?? null;
}

function dedupeThresholdMeters(item) {
  if (item.largeAreaCandidate) return 3000;
  if (["dune", "sandbank", "nature_reserve", "bird_reserve", "harbour", "oyster_harbour"].includes(item.photoAtlasType)) return 2500;
  if (["pier", "lighthouse", "observatory", "viewpoint"].includes(item.photoAtlasType)) return 600;
  return 400;
}

function shouldGroupPlaces(a, b) {
  if (a.photoAtlasType !== b.photoAtlasType) return false;
  const aName = a.name ?? a.nameFr ?? null;
  const bName = b.name ?? b.nameFr ?? null;
  const aNormalized = normalizeName(aName);
  const bNormalized = normalizeName(bName);
  const sameName = aNormalized && bNormalized && aNormalized === bNormalized;
  const sameDocKey = documentaryKey(a) && documentaryKey(a) === documentaryKey(b);
  if (!sameName && !sameDocKey) return false;
  if (a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) return sameDocKey;
  const threshold = Math.max(dedupeThresholdMeters(a), dedupeThresholdMeters(b));
  return distanceMeters(a, b) <= threshold || sameDocKey;
}

function samePlaceRepresentation(primary, other) {
  const primaryName = normalizeName(primary.name ?? primary.nameFr ?? null);
  const otherName = normalizeName(other.name ?? other.nameFr ?? null);
  const sameName = primaryName && otherName && primaryName === otherName;
  const sameDocKey = documentaryKey(primary) && documentaryKey(primary) === documentaryKey(other);
  const compatibleFamily = primary.photoAtlasFamily && other.photoAtlasFamily && primary.photoAtlasFamily === other.photoAtlasFamily;
  const compatibleType = primary.photoAtlasType === other.photoAtlasType || (
    [primary.photoAtlasType, other.photoAtlasType].every((type) => ["harbour", "oyster_harbour", "quay", "ponton"].includes(type))
  );
  if (!(sameName || sameDocKey)) return false;
  if (!(compatibleType || compatibleFamily || sameDocKey)) return false;
  if (primary.latitude === null || primary.longitude === null || other.latitude === null || other.longitude === null) return sameDocKey;
  return distanceMeters(primary, other) <= Math.max(dedupeThresholdMeters(primary), dedupeThresholdMeters(other)) * 1.5 || sameDocKey;
}

function choosePrimaryRepresentation(group) {
  const referenceName = group.find((item) => bassinExpectedTypes.has(item.name))?.name ?? null;
  return [...group].sort((a, b) => {
    if (referenceName) {
      const refBest = (b.name === referenceName) - (a.name === referenceName);
      if (refBest !== 0) return refBest;
      const refType = (b.photoAtlasType === bassinExpectedTypes.get(referenceName)) - (a.photoAtlasType === bassinExpectedTypes.get(referenceName));
      if (refType !== 0) return refType;
    }
    const objectDelta = representationObjectPriority(b) - representationObjectPriority(a);
    if (objectDelta !== 0) return objectDelta;
    const typeDelta = representationPriority(b) - representationPriority(a);
    if (typeDelta !== 0) return typeDelta;
    const scoreDelta = b.premiumScore - a.premiumScore;
    if (scoreDelta !== 0) return scoreDelta;
    const confidenceDelta = (b.confidence === "HIGH") - (a.confidence === "HIGH");
    if (confidenceDelta !== 0) return confidenceDelta;
    const docDelta = Number(Boolean(documentaryKey(b))) - Number(Boolean(documentaryKey(a)));
    if (docDelta !== 0) return docDelta;
    return 0;
  })[0] ?? null;
}

function buildPlaceKey(primary) {
  const normalized = normalizeName(primary.name ?? primary.nameFr ?? primary.officialName ?? `${primary.photoAtlasType}-${primary.osmType}-${primary.osmId}`);
  const lat = Math.round(primary.latitude * 1000);
  const lon = Math.round(primary.longitude * 1000);
  return `${normalized}--${primary.photoAtlasType}--${lat}-${lon}`;
}

function deduplicatePremiumPlaces(items, allQualifiedItems) {
  const groups = [];
  for (const item of items) {
    let matchedGroup = null;
    for (const group of groups) {
      if (group.some((existing) => shouldGroupPlaces(existing, item))) {
        matchedGroup = group;
        break;
      }
    }
    if (matchedGroup) matchedGroup.push(item);
    else groups.push([item]);
  }

  const deduplicated = groups.map((group) => {
    const primary = choosePrimaryRepresentation(group);
    const relatedRepresentations = allQualifiedItems.filter((item) => samePlaceRepresentation(primary, item));
    const alternates = relatedRepresentations
      .filter((item) => !(item.osmType === primary.osmType && item.osmId === primary.osmId))
      .sort((a, b) => b.premiumScore - a.premiumScore)
      .map((item) => ({
        osmType: item.osmType,
        osmId: item.osmId,
        sourceExternalId: item.sourceExternalId,
        photoAtlasType: item.photoAtlasType,
        principalTag: item.principalTag,
        confidence: item.confidence,
        premiumScore: item.premiumScore,
        premium: item.premium,
      }));

    return {
      placeKey: buildPlaceKey(primary),
      name: primary.name,
      nameFr: primary.nameFr,
      latitude: primary.latitude,
      longitude: primary.longitude,
      photoAtlasType: primary.photoAtlasType,
      photoAtlasFamily: primary.photoAtlasFamily,
      remarkableScore: primary.remarkableScore,
      photographicScore: primary.photographicScore,
      premiumScore: primary.premiumScore,
      confidence: primary.confidence,
      premiumReasons: primary.premiumReasons,
      osmRepresentations: [
        {
          osmType: primary.osmType,
          osmId: primary.osmId,
          sourceExternalId: primary.sourceExternalId,
          photoAtlasType: primary.photoAtlasType,
          principalTag: primary.principalTag,
          coordinateSource: primary.coordinateSource,
          confidence: primary.confidence,
          premiumScore: primary.premiumScore,
          premium: primary.premium,
          isPrimary: true,
        },
        ...alternates.map((item) => ({ ...item, isPrimary: false })),
      ],
      duplicateCount: 1 + alternates.length,
    };
  }).sort((a, b) => b.premiumScore - a.premiumScore || a.name.localeCompare(b.name, "fr"));

  return {
    groups,
    deduplicated,
  };
}

function buildDuplicateIndex(candidates) {
  const byName = new Map();
  for (const candidate of candidates) {
    const normalized = normalizeName(candidate.name ?? candidate.nameFr ?? candidate.officialName ?? null);
    if (!normalized) continue;
    const list = byName.get(normalized) ?? [];
    list.push(candidate);
    byName.set(normalized, list);
  }
  return byName;
}

function isDuplicateSuspect(candidate, byName) {
  const normalized = normalizeName(candidate.name ?? candidate.nameFr ?? candidate.officialName ?? null);
  if (!normalized) return false;
  const siblings = byName.get(normalized) ?? [];
  if (siblings.length <= 1) return false;
  return siblings.some((other) => {
    if (other.osmType === candidate.osmType && other.osmId === candidate.osmId) return false;
    if (other.latitude === null || other.longitude === null || candidate.latitude === null || candidate.longitude === null) return true;
    return distanceMeters(candidate, other) <= 1500;
  });
}

const candidates = [];
const reader = createInterface({ input: createReadStream(inputJsonl, "utf8"), crlfDelay: Infinity });

for await (const line of reader) {
  if (!line.trim()) continue;
  candidates.push(JSON.parse(line));
}

const byName = buildDuplicateIndex(candidates);

const premiumCandidates = [];
const rejectedHighPotential = [];
const allQualifiedCandidates = [];
const basinTargets = [
  "Dune du Pilat",
  "Banc d'Arguin",
  "Port de Larros",
  "Port ostréicole de La Teste",
  "Jetée d'Andernos",
  "Jetée Bélisaire",
  "Phare du Cap-Ferret",
  "Plage du Moulleau",
  "Réserve ornithologique du Teich",
  "Observatoire Sainte-Cécile",
];

const stats = {
  before: candidates.length,
  beforePrevious: 194,
  premium: 0,
  nonPremium: 0,
  familyCounts: {
    Littoral: 0,
    Maritime: 0,
    Nature: 0,
    Relief: 0,
    Architecture: 0,
    Observation: 0,
    Faune: 0,
    Structures: 0,
  },
  typeCounts: {},
  confidenceCounts: {
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  },
  genericPremiumCounts: {
    beach: 0,
    forest: 0,
    village: 0,
    religious_building: 0,
    viewpoint: 0,
    "tourism=attraction": 0,
  },
  basinSpots: [],
};

const basinMatches = new Map(basinTargets.map((name) => [name, []]));

for (const candidate of candidates) {
  const classification = classify(candidate);
  const nearbyCandidates = byName.get(normalizeName(candidate.name ?? candidate.nameFr ?? candidate.officialName ?? null)) ?? [];
  const score = computeScores(candidate, classification, nearbyCandidates);
  const duplicateSuspect = isDuplicateSuspect(candidate, byName);
  const premiumEligible =
    Boolean(classification.photoAtlasType) &&
    classification.confidence !== "LOW" &&
    score.isDistinctDestination &&
    score.remarkableEligible &&
    score.photographicEligible &&
    score.distinctiveSignalEligible &&
    score.premiumScore >= premiumThreshold &&
    Boolean(candidate.name ?? candidate.nameFr ?? candidate.officialName) &&
    candidate.latitude !== null &&
    candidate.longitude !== null;

  const missingConditions = [
    !score.isDistinctDestination ? "destination" : null,
    !score.remarkableEligible ? "remarkable" : null,
    !score.photographicEligible ? "photographic" : null,
    !score.distinctiveSignalEligible ? "distinctiveSignal" : null,
    classification.confidence === "LOW" ? "confidence" : null,
    score.premiumScore < premiumThreshold ? "premiumScore" : null,
    !(candidate.name ?? candidate.nameFr ?? candidate.officialName) ? "name" : null,
    candidate.latitude === null || candidate.longitude === null ? "coordinates" : null,
  ].filter(Boolean);

  const qualified = {
    osmId: candidate.osmId,
    osmType: candidate.osmType,
    source: "osm",
    sourceExternalId: `osm:${candidate.osmType}/${candidate.osmId}`,
    name: candidate.name,
    nameFr: candidate.nameFr,
    latitude: round(candidate.latitude),
    longitude: round(candidate.longitude),
    photoAtlasType: classification.photoAtlasType,
    photoAtlasFamily: classification.photoAtlasFamily,
    confidence: classification.confidence,
    remarkableScore: score.remarkableScore,
    photographicScore: score.photographicScore,
    premiumScore: score.premiumScore,
    distinctiveSignals: score.distinctiveSignals,
    distinctiveSignalEligible: score.distinctiveSignalEligible,
    isDistinctDestination: score.isDistinctDestination,
    remarkableEligible: score.remarkableEligible,
    photographicEligible: score.photographicEligible,
    missingConditions,
    premiumReasons: score.premiumReasons,
    duplicateSuspect,
    largeAreaCandidate: candidate.large_area_candidate,
    osmTags: candidate.tags,
    principalTag: candidate.principalTag,
    coordinateSource: candidate.coordinateSource,
    premium: premiumEligible,
  };

  for (const target of basinTargets) {
    if (matchesReferenceSpot(qualified.name ?? "", target)) {
      basinMatches.get(target)?.push(qualified);
    }
  }

  allQualifiedCandidates.push(qualified);

  if (premiumEligible) {
    premiumCandidates.push(qualified);
    stats.premium += 1;
    stats.familyCounts[qualified.photoAtlasFamily] += 1;
    stats.typeCounts[qualified.photoAtlasType] = (stats.typeCounts[qualified.photoAtlasType] ?? 0) + 1;
    stats.confidenceCounts[qualified.confidence] += 1;
    if (qualified.photoAtlasType === "beach") stats.genericPremiumCounts.beach += 1;
    if (qualified.photoAtlasType === "forest") stats.genericPremiumCounts.forest += 1;
    if (qualified.photoAtlasType === "village") stats.genericPremiumCounts.village += 1;
    if (qualified.photoAtlasType === "religious_building") stats.genericPremiumCounts.religious_building += 1;
    if (qualified.photoAtlasType === "viewpoint") stats.genericPremiumCounts.viewpoint += 1;
    if (qualified.principalTag === "tourism=attraction") stats.genericPremiumCounts["tourism=attraction"] += 1;
  } else {
    stats.nonPremium += 1;
    const nearThreshold =
      score.baseRankingScore >= 50 ||
      score.remarkableScore >= remarkableThreshold - 10 ||
      score.photographicScore >= photographicThreshold - 10;
    if (nearThreshold) {
      rejectedHighPotential.push({
        name: qualified.name,
        photoAtlasType: qualified.photoAtlasType,
        remarkableScore: qualified.remarkableScore,
        photographicScore: qualified.photographicScore,
        premiumScore: qualified.premiumScore,
        confidence: qualified.confidence,
        rejectionReasons: qualified.premiumReasons,
        missingConditions,
        principalTag: qualified.principalTag,
      });
    }
  }
}

premiumCandidates.sort((a, b) => b.premiumScore - a.premiumScore || a.name.localeCompare(b.name, "fr"));
rejectedHighPotential.sort((a, b) => b.premiumScore - a.premiumScore || (a.name ?? "").localeCompare(b.name ?? "", "fr"));

const deduplication = deduplicatePremiumPlaces(premiumCandidates, allQualifiedCandidates);

stats.typeCounts = Object.fromEntries(Object.entries(stats.typeCounts).sort((a, b) => b[1] - a[1]));

stats.basinSpots = basinTargets.map((name) => {
  const matches = basinMatches.get(name) ?? [];
  const best = chooseBestReferenceRepresentation(name, matches);
  return {
    name,
    foundInCandidates: matches.length > 0,
    premium: best?.premium ?? false,
    score: best?.premiumScore ?? null,
    type: best?.photoAtlasType ?? null,
    remarkableScore: best?.remarkableScore ?? null,
    photographicScore: best?.photographicScore ?? null,
    confidence: best?.confidence ?? null,
    expectedType: bassinExpectedTypes.get(name) ?? null,
    currentPhotoAtlasType: bassinCurrentType.get(name) ?? null,
    candidateCount: matches.length,
  };
});

const report = {
  dataset: inputJsonl,
  generatedAt: new Date().toISOString(),
  thresholds: {
    remarkableThreshold,
    photographicThreshold,
    premiumThreshold,
  },
  before: stats.before,
  beforePrevious: stats.beforePrevious,
  premium: stats.premium,
  nonPremium: stats.nonPremium,
  premiumByFamily: stats.familyCounts,
  premiumByType: stats.typeCounts,
  confidence: stats.confidenceCounts,
  top200: premiumCandidates.slice(0, 200).map((candidate) => ({
    name: candidate.name,
    type: candidate.photoAtlasType,
    family: candidate.photoAtlasFamily,
    remarkableScore: candidate.remarkableScore,
    photographicScore: candidate.photographicScore,
    premiumScore: candidate.premiumScore,
    confidence: candidate.confidence,
    distinctiveSignals: candidate.distinctiveSignals,
    reasons: candidate.premiumReasons,
  })),
  falsePremiums: rejectedHighPotential.slice(0, 50),
  premiumDeduplicated: deduplication.deduplicated.length,
  deduplication: {
    groupsMerged: deduplication.groups.filter((group) => group.length > 1).length,
    alternateRepresentations: deduplication.groups.reduce((sum, group) => sum + Math.max(0, group.length - 1), 0),
    thresholdPolicy: {
      pointLikeMeters: 400,
      maritimeNatureMeters: 2500,
      largeAreaMeters: 3000,
      preciseStructuresMeters: 600,
    },
  },
  basinSpots: stats.basinSpots,
  genericTypes: stats.genericPremiumCounts,
  quality: {
    highPriorityPremiums: premiumCandidates.filter((candidate) => highPriorityTypes.has(candidate.photoAtlasType)).length,
    genericPremiums: premiumCandidates.filter((candidate) => genericTypes.has(candidate.photoAtlasType) || candidate.principalTag === "tourism=attraction").length,
    largeAreaPremiums: premiumCandidates.filter((candidate) => candidate.largeAreaCandidate).length,
    architectureShare: stats.premium === 0 ? 0 : Number(((stats.familyCounts.Architecture / stats.premium) * 100).toFixed(2)),
    premiumBelow80Count: premiumCandidates.filter((candidate) => candidate.premiumScore < 80).length,
  },
  limitations: {
    missingObservatoireSainteCecileFromCandidates: !(basinMatches.get("Observatoire Sainte-Cécile")?.length),
    missingJeteeBelisaireExactNameFromCandidates: !(basinMatches.get("Jetée Bélisaire")?.length),
    note: "La seconde passe ne relit pas le PBF et dépend strictement du JSONL intermédiaire issu du premier filtre.",
  },
};

function runRegressionChecks() {
  const failures = [];
  if (deduplication.deduplicated.some((item) => item.premiumScore < 80)) failures.push("Premium < 80 détecté dans la sortie dédupliquée");
  if (deduplication.deduplicated.some((item) => item.confidence === "LOW")) failures.push("Premium LOW détecté dans la sortie dédupliquée");
  const placeKeys = new Set();
  for (const item of deduplication.deduplicated) {
    if (placeKeys.has(item.placeKey)) failures.push(`placeKey dupliqué: ${item.placeKey}`);
    placeKeys.add(item.placeKey);
  }

  const requiredPremiums = [
    ["Dune du Pilat", "dune"],
    ["Banc d'Arguin", "sandbank"],
    ["Phare du Cap-Ferret", "lighthouse"],
    ["Port ostréicole de La Teste", "oyster_harbour"],
    ["Réserve ornithologique du Teich", "bird_reserve"],
    ["Observatoire Sainte-Cécile", "observatory"],
  ];

  for (const [name, type] of requiredPremiums) {
    const match = deduplication.deduplicated.find((item) => item.name === name && item.photoAtlasType === type);
    if (!match) failures.push(`Spot de référence manquant ou non Premium: ${name} (${type})`);
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}

const regressionChecks = runRegressionChecks();
report.tests = regressionChecks;

await writeFile(outputPremium, `${JSON.stringify(premiumCandidates, null, 2)}\n`, "utf8");
await writeFile(outputPremiumDeduplicated, `${JSON.stringify(deduplication.deduplicated, null, 2)}\n`, "utf8");
await writeFile(outputStats, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (process.argv.includes("--self-test") && !regressionChecks.passed) {
  console.error(JSON.stringify(regressionChecks, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  outputPremium,
  outputPremiumDeduplicated,
  outputStats,
  premium: stats.premium,
  premiumDeduplicated: deduplication.deduplicated.length,
  nonPremium: stats.nonPremium,
  genericPremiums: report.quality.genericPremiums,
  largeAreaPremiums: report.quality.largeAreaPremiums,
  premiumBelow80Count: report.quality.premiumBelow80Count,
  regressionChecksPassed: regressionChecks.passed,
}, null, 2));