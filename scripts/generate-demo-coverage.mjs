// Simulated evidence only. Never modifies supplied research or legacy fixtures.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { programs } from "../lib/programs.ts";

const readJSON = async relative => JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"));
const world = await readJSON("../data/world.json");
const regions = await readJSON("../data/map-regions.json");
const template = await readJSON("../data/study-records/demo-01.json");

// Each topic has a coherent principle and outcome, rather than independent tag cycles.
const themes = {
  water: ["Irrigation scheduling and water use", "Efficiency", "Environment", "plot-herd"],
  drip: ["Drip irrigation and crop yield", "Efficiency", "Productivity", "plot-herd"],
  solar: ["Solar irrigation and pumping costs", "Efficiency", "Economic", "farm"],
  trees: ["Agroforestry and habitat diversity", "Diversity", "Environment", "landscape"],
  intercrop: ["Intercropping and farm income", "Diversity", "Economic", "farm"],
  nutrients: ["Nutrient recycling and soil health", "Recycling", "Environment", "farm"],
  manure: ["Manure recycling and input costs", "Recycling", "Economic", "farm"],
  ricefish: ["Integrated rice-fish systems and production", "Synergies", "Productivity", "farm"],
  feed: ["Crop-livestock integration and feed production", "Synergies", "Productivity", "plot-herd"],
  drought: ["Drought-adapted forage and production stability", "Resilience", "Productivity", "farm"],
  labor: ["Aquaculture water monitoring and labor requirements", "Efficiency", "Human Condition", "farm"],
  learning: ["Participatory crop trials and knowledge sharing", "Co-creation and sharing of knowledge", "Social", "landscape"],
  governance: ["Community watershed planning and collective decisions", "Responsible governance", "Social", "landscape"],
};

// Illustrative scenarios, not claims about actual country research portfolios.
// Program coverage, study volumes, and topic mixes intentionally differ.
const profiles = [
  { iso: "MA", series: [["multifunctional-landscapes", "water", 24], ["sustainable-farming", "drip", 12], ["nexus-gains", "solar", 6]] },
  { iso: "KE", series: [["agroecology", "trees", 18], ["nature-positive-solutions", "trees", 10], ["mixed-farming-systems", "feed", 12], ["multifunctional-landscapes", "trees", 6]] },
  { iso: "ET", series: [["livestock-and-climate", "drought", 20], ["sustainable-animal-productivity", "feed", 6], ["excellence-in-agronomy", "drip", 4]] },
  { iso: "SN", series: [["multifunctional-landscapes", "water", 14], ["mixed-farming-systems", "manure", 7]] },
  { iso: "IN", series: [["sustainable-farming", "drip", 18], ["excellence-in-agronomy", "drip", 10], ["excellence-in-agronomy", "learning", 8]] },
  { iso: "BD", series: [["aquatic-foods", "ricefish", 18], ["sustainable-animal-and-aquatic-foods", "labor", 6]] },
  { iso: "VN", series: [["aquatic-foods", "nutrients", 12], ["sustainable-animal-and-aquatic-foods", "ricefish", 7]] },
  { iso: "NP", series: [["agroecology", "learning", 9], ["sustainable-farming", "drip", 3]] },
  { iso: "BR", series: [["nature-positive-solutions", "trees", 16], ["multifunctional-landscapes", "nutrients", 8]] },
  { iso: "PE", series: [["multifunctional-landscapes", "governance", 10], ["agroecology", "intercrop", 4]] },
  { iso: "CO", series: [["nature-positive-solutions", "trees", 9], ["multifunctional-landscapes", "intercrop", 4]] },
  { iso: "JO", series: [["nexus-gains", "water", 8]] },
  { iso: "TN", series: [["sustainable-farming", "solar", 5]] },
  { iso: "UG", series: [["mixed-farming-systems", "nutrients", 6], ["sustainable-animal-productivity", "manure", 3]] },
  { iso: "TZ", series: [["livestock-and-climate", "drought", 7], ["sustainable-animal-and-aquatic-foods", "feed", 4]] },
  { iso: "ZM", series: [["multifunctional-landscapes", "governance", 4]] },
];

const regionOf = Object.fromEntries(Object.entries(regions).flatMap(([region, codes]) => codes.split(" ").map(iso => [iso, region])));
const noStudyCountries = new Set(["ER", "GY"]); // Eritrea and Guyana demonstrate no-data states.
const topicFamilies = [
  ["water"], ["solar", "drip"], ["trees", "nutrients"], ["ricefish", "manure"],
  ["drought", "feed", "water"], ["water", "drip", "intercrop", "learning"],
  ["trees", "nutrients", "manure", "governance"],
  ["water", "drought", "feed", "learning", "solar"],
];
const countryFocus = {
  MA: ["water", "drip", "intercrop"], KE: ["trees", "feed", "nutrients", "learning"], ET: ["drought", "drip", "manure"],
  SN: ["water", "trees", "learning"], IN: ["drip", "learning", "solar"], BD: ["ricefish", "labor"],
  VN: ["nutrients", "ricefish"], NP: ["learning"], BR: ["trees", "nutrients"],
  PE: ["governance", "intercrop"], CO: ["trees", "intercrop"], JO: ["water"],
  TN: ["solar", "drip"], UG: ["nutrients", "manure", "feed"], TZ: ["drought", "feed", "water", "learning"],
  ZM: ["governance", "learning"], RW: ["trees", "intercrop", "learning"],
  MW: ["nutrients", "manure"], ML: ["water", "drought"],
};
const countryTopics = new Map();
const mapCountries = world.features
  .filter(f => regionOf[f.properties.ISO_A2_EH] && f.properties.ISO_A2_EH !== "EH")
  .sort((a, b) => a.properties.ISO_A2_EH.localeCompare(b.properties.ISO_A2_EH));

for (const feature of mapCountries) {
  const iso = feature.properties.ISO_A2_EH;
  if (noStudyCountries.has(iso)) continue;
  let profile = profiles.find(p => p.iso === iso);
  if (!profile) {
    profile = { iso, series: [] };
    profiles.push(profile);
  }
  // Country portfolios vary from narrow to broad. African countries carry
  // more studies, while topic breadth remains visible within each program too.
  const seed = parseInt(createHash("sha256").update(iso).digest("hex").slice(0, 8), 16);
  const topics = countryFocus[iso] ?? topicFamilies[seed % topicFamilies.length];
  countryTopics.set(iso, topics);
  const african = regionOf[iso] === "Africa";
  const previousSeries = profile.series;
  profile.series = [];
  for (const [index, program] of programs.entries()) {
    const existing = previousSeries.filter(([slug]) => slug === program.slug);
    const previousCount = existing.reduce((total, [, , count]) => total + count, 0);
    const desiredCount = previousCount
      ? (african ? Math.max(8, Math.round(previousCount * 1.5)) : Math.min(3, previousCount))
      : (african ? 8 + ((seed + index * 3) % 7) : 1 + ((seed + index * 7) % 3));
    const total = Math.max(topics.length, desiredCount);
    const counts = topics.map(() => 1);
    // Give each topic a study, then emphasize a main topic rather than making
    // every ribbon equal. Keep the country's total budget independent of breadth.
    const primary = (seed + index) % topics.length;
    for (let i = topics.length; i < total; i++) {
      const topicIndex = i % 3 === 0 ? (primary + i) % topics.length : primary;
      counts[topicIndex]++;
    }
    topics.forEach((theme, topicIndex) => profile.series.push([program.slug, theme, counts[topicIndex]]));
  }
}

const batches = Object.fromEntries(Object.keys(regions).map(region => [region, []]));
const uuidFor = key => {
  const hex = createHash("sha256").update(`cgspace-focused-demo:${key}`).digest("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

function classify(record, theme, sequence) {
  const [topic, principle, domain, scale] = themes[theme];
  const p = record.probabilistic;
  p.is_technological_innovation.innovation_name = `${topic} in ${record.deterministic.country.join(" and ")}`;
  p.scale.value = scale;
  p.agroecological_principles = [{ ...structuredClone(template.probabilistic.agroecological_principles[0]), code: principle }];
  p.impact_domains = [{
    ...structuredClone(template.probabilistic.impact_domains[0]), code: domain,
    direction: sequence % 5 === 0 ? "mixed" : "positive",
    assessment_basis_note: "MOCK outcome classification for interface demonstration; no actual finding is asserted.",
  }];
  p.principles_considered_and_rejected = {};
  p.domains_considered_and_rejected = {};
}

for (const { iso, series } of profiles) {
  const feature = world.features.find(f => f.properties.ISO_A2_EH === iso);
  if (!feature || !regionOf[iso]) throw new Error(`Unknown demo country ${iso}`);
  const name = feature.properties.name;
  const region = regionOf[iso];
  for (const [slug, theme, count] of series) {
    const program = programs.find(p => p.slug === slug);
    if (!program || !themes[theme]) throw new Error(`Unknown demo scenario ${slug}/${theme}`);
    const [topic] = themes[theme];
    for (let i = 0; i < count; i++) {
      const record = structuredClone(template);
      record.extracted_at = "2026-11-03";
      record.extracted_by = "mock-data";
      record.provenance_basis = "MOCK: simulated evidence pattern; not extracted from a publication";
      record.reviewer_brief = "Simulated study for previewing uneven coverage and focused connections. Country, date, tags and outcomes are invented; do not cite as research evidence.";
      const title = `${topic} in ${name} — simulated study ${i + 1}`;
      const initiative = program.kind === "initiative";
      Object.assign(record.deterministic, {
        item_uuid: uuidFor(`${iso}:${slug}:${theme}:${i}`), handle: "", title: `[Demo] ${title}`,
        url: `https://cgspace.cgiar.org/collections/${program.collection}/search`,
        issued: `${2021 + i % 5}-${String(1 + i % 12).padStart(2, "0")}`,
        collections: [initiative ? `CGIAR Initiative on ${program.name}` : `SP ${program.name}`],
        programs: initiative ? [] : [program.name], initiatives: initiative ? [program.name] : [],
        country: [name], country_iso2: [iso], region: [region],
      });
      classify(record, theme, i);
      Object.assign(record.probabilistic.geolocation, { country_from_metadata: [name], iso2: [iso], region_from_metadata: [region] });
      batches[region].push(record);
    }
  }
}
for (const [region, records] of Object.entries(batches)) {
  const filename = `../data/study-records/demo-coverage-${region.toLowerCase().replaceAll(" ", "-")}.json`;
  await writeFile(new URL(filename, import.meta.url), `[\n${records.map(record => JSON.stringify(record)).join(",\n")}\n]\n`);
}
// Align the older synthetic examples too, retaining their IDs and collection
// membership. Never edit or trim the supplied research record's real labels.
for (let i = 1; i <= 15; i++) {
  const filename = `../data/study-records/demo-${String(i).padStart(2, "0")}.json`;
  const record = await readJSON(filename);
  const countries = record.deterministic.country_iso2;
  const topics = countryTopics.get(countries[0]).filter(theme => countries.every(iso => countryTopics.get(iso)?.includes(theme)));
  if (!topics.length) throw new Error(`No common simulated topic for ${filename}`);
  const theme = topics[(i - 1) % topics.length];
  classify(record, theme, i - 1);
  record.deterministic.title = `[Demo] ${record.probabilistic.is_technological_innovation.innovation_name} — example ${i}`;
  record.extracted_at = "2026-11-03";
  await writeFile(new URL(filename, import.meta.url), `${JSON.stringify(record, null, 2)}\n`);
}
console.log(`Generated ${Object.values(batches).flat().length} simulated studies across ${profiles.length} countries and ${programs.length} programs, with focused topics and uneven coverage.`);
