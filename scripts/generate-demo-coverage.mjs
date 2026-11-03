// Synthetic map fixtures only. This never modifies supplied research or the legacy data.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { programs as catalog } from "../lib/programs.ts";

const readJSON = async relative => JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"));
const world = await readJSON("../data/world.json");
const regions = await readJSON("../data/map-regions.json");
const template = await readJSON("../data/study-records/demo-01.json");
const programs = [
  { name: "Multifunctional Landscapes", id: "32ac7c8f-6874-4c3a-83b0-6223934600ca", topics: ["Agroforestry monitoring", "Soil and water conservation", "Landscape restoration", "Diversified land-use planning", "Watershed management", "Biodiversity observation"] },
  { name: "Sustainable Animal and Aquatic Foods", id: "246d18a3-fdff-4f05-a918-94b617dc158e", topics: ["Integrated feed management", "Aquaculture water monitoring", "Circular nutrient management", "Livestock health monitoring", "Improved forage systems", "Resource-efficient food production"] },
  { name: "Sustainable Farming", id: "906d7b6e-625e-4fa4-8022-9e8e6804232a", topics: ["Precision irrigation", "Crop rotation systems", "Compost and soil fertility", "Integrated pest management", "Drought-resilient cultivation", "Participatory crop selection"] },
];
const initiativeTopics = {
  agroecology: ["Diversified cropping systems", "Biological pest management", "Participatory soil monitoring", "Agroecological farm design", "Compost and nutrient cycling", "Agroforestry integration"],
  "aquatic-foods": ["Aquaculture water monitoring", "Integrated rice-fish farming", "Sustainable fish feed", "Pond nutrient management", "Fish health monitoring", "Solar fish drying"],
  "excellence-in-agronomy": ["Digital agronomic advice", "Precision nutrient management", "Crop monitoring sensors", "Site-specific fertilizer application", "Mechanized crop establishment", "Remote sensing for crop management"],
  "livestock-and-climate": ["Climate-informed grazing", "Livestock heat monitoring", "Drought-resilient forage", "Manure emissions management", "Water-efficient livestock systems", "Pasture condition monitoring"],
  "mixed-farming-systems": ["Integrated crop-livestock management", "Crop residue feed processing", "Manure nutrient recycling", "Mixed-farm water management", "Intercropping and forage systems", "Small-farm mechanization"],
  "nature-positive-solutions": ["Biodiversity monitoring", "Ecological field boundaries", "Restoration planting systems", "Soil biodiversity management", "Pollinator habitat management", "Agroforestry restoration"],
  "nexus-gains": ["Solar irrigation scheduling", "Water-energy monitoring", "Integrated watershed planning", "Resource-efficient food processing", "Water reuse systems", "Ecosystem flow monitoring"],
  "sustainable-animal-productivity": ["Improved forage systems", "Livestock health monitoring", "Precision feeding", "Animal breeding decision support", "Feed conservation systems", "Dairy production monitoring"],
};
const initiatives = catalog.filter(program => program.kind === "initiative").map(program => {
  const topics = initiativeTopics[program.slug];
  if (!topics) throw new Error(`Missing demo topics for ${program.slug}`);
  return { ...program, id: program.collection, topics };
});
const principles = ["Efficiency", "Diversity", "Recycling", "Resilience", "Synergies", "Co-creation and sharing of knowledge", "Responsible governance"];
const domains = ["Environment", "Productivity", "Economic", "Human Condition", "Social"];
const scales = ["plot-herd", "farm", "landscape"];
const regionOf = Object.fromEntries(Object.entries(regions).flatMap(([region,codes]) => codes.split(" ").map(iso => [iso,region])));
const batches = Object.fromEntries(Object.keys(regions).map(region => [region,[]]));
const countries = world.features.filter(f => regionOf[f.properties.ISO_A2_EH]).sort((a,b) => a.properties.ISO_A2_EH.localeCompare(b.properties.ISO_A2_EH));
const uuidFor = key => {
  const hex = createHash("sha256").update(`cgspace-map-demo:${key}`).digest("hex");
  return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
};
for (const [countryIndex,feature] of countries.entries()) {
  const {name,ISO_A2_EH:iso} = feature.properties;
  const region = regionOf[iso];
  // Preserve the original three programs' records and identifiers.
  const total = 3 + ((countryIndex * 17 + iso.charCodeAt(0) + iso.charCodeAt(1)) % 34);
  const samples = Array.from({ length: total }, (_, i) => ({
    program: programs[i % programs.length], i, sequence: Math.floor(i / programs.length), key: `${iso}:${i}`,
  }));
  // Give every additional initiative the same selectable, country-specific preview.
  for (const [initiativeIndex, program] of initiatives.entries()) {
    const count = 1 + ((countryIndex + initiativeIndex) % 3);
    for (let sequence = 0; sequence < count; sequence++) {
      samples.push({ program, i: total + initiativeIndex * 3 + sequence, sequence, key: `${iso}:${program.slug}:${sequence}` });
    }
  }
  for (const { program, i, sequence, key } of samples) {
    const isInitiative = program.kind === "initiative";
    const record = structuredClone(template);
    record.extracted_at = isInitiative ? "2026-11-03" : "2026-10-16";
    record.provenance_basis = "MOCK: synthetic country-coverage fixture; not extracted from a publication";
    record.reviewer_brief = "Demo only. The location, date, practice and labels are synthetic and do not assert research conducted in this country.";
    const title = `${program.topics[(countryIndex + sequence) % program.topics.length]} in ${name} — preview ${sequence + 1}`;
    Object.assign(record.deterministic, {
      item_uuid: uuidFor(key), handle: "", title: `[Demo] ${title}`,
      url: `https://cgspace.cgiar.org/collections/${program.id}/search`,
      issued: `${2022 + ((countryIndex + i) % 5)}-${String(1 + ((countryIndex * 3 + i) % 12)).padStart(2,"0")}`,
      collections: [isInitiative ? `CGIAR Initiative on ${program.name}` : `SP ${program.name}`],
      programs: isInitiative ? [] : [program.name], initiatives: isInitiative ? [program.name] : [],
      country: [name], country_iso2: [iso], region: [region],
    });
    const p = record.probabilistic;
    p.is_technological_innovation.innovation_name = title;
    p.scale.value = scales[(countryIndex + i) % scales.length];
    p.agroecological_principles = [0,1].map(offset => ({...structuredClone(template.probabilistic.agroecological_principles[0]),code:principles[(countryIndex + i + offset * 3) % principles.length]}));
    p.impact_domains = [0,1].map(offset => ({...structuredClone(template.probabilistic.impact_domains[0]),code:domains[(countryIndex + i + offset * 2) % domains.length]}));
    Object.assign(p.geolocation,{country_from_metadata:[name],iso2:[iso],region_from_metadata:[region]});
    batches[region].push(record);
  }
}
for (const [region,records] of Object.entries(batches)) {
  const filename = `../data/study-records/demo-coverage-${region.toLowerCase().replaceAll(" ","-")}.json`;
  // One record per line keeps these same-schema fixture batches compact and inspectable.
  await writeFile(new URL(filename,import.meta.url), `[\n${records.map(record => JSON.stringify(record)).join(",\n")}\n]\n`);
}
console.log(`Generated ${Object.values(batches).flat().length} synthetic studies covering ${countries.length} map countries and all ${catalog.length} programs and initiatives.`);
