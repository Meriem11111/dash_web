// Synthetic map fixtures only. This never modifies supplied research or the legacy data.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const readJSON = async relative => JSON.parse(await readFile(new URL(relative, import.meta.url), "utf8"));
const world = await readJSON("../data/world.json");
const regions = await readJSON("../data/map-regions.json");
const template = await readJSON("../data/study-records/demo-01.json");
const programs = [
  { name: "Multifunctional Landscapes", id: "32ac7c8f-6874-4c3a-83b0-6223934600ca", topics: ["Agroforestry monitoring", "Soil and water conservation", "Landscape restoration", "Diversified land-use planning", "Watershed management", "Biodiversity observation"] },
  { name: "Sustainable Animal and Aquatic Foods", id: "246d18a3-fdff-4f05-a918-94b617dc158e", topics: ["Integrated feed management", "Aquaculture water monitoring", "Circular nutrient management", "Livestock health monitoring", "Improved forage systems", "Resource-efficient food production"] },
  { name: "Sustainable Farming", id: "906d7b6e-625e-4fa4-8022-9e8e6804232a", topics: ["Precision irrigation", "Crop rotation systems", "Compost and soil fertility", "Integrated pest management", "Drought-resilient cultivation", "Participatory crop selection"] },
];
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
  // Every country appears in all three programs; totals vary from 3 to 36.
  const total = 3 + ((countryIndex * 17 + iso.charCodeAt(0) + iso.charCodeAt(1)) % 34);
  for (let i = 0; i < total; i++) {
    const programIndex = i % programs.length;
    const program = programs[programIndex];
    const record = structuredClone(template);
    record.extracted_at = "2026-10-16";
    record.provenance_basis = "MOCK: synthetic country-coverage fixture; not extracted from a publication";
    record.reviewer_brief = "Demo only. The location, date, practice and labels are synthetic and do not assert research conducted in this country.";
    const title = `${program.topics[(countryIndex + Math.floor(i / 3)) % program.topics.length]} in ${name} — preview ${Math.floor(i / 3) + 1}`;
    Object.assign(record.deterministic, {
      item_uuid: uuidFor(`${iso}:${i}`), handle: "", title: `[Demo] ${title}`,
      url: `https://cgspace.cgiar.org/collections/${program.id}/search`,
      issued: `${2022 + ((countryIndex + i) % 5)}-${String(1 + ((countryIndex * 3 + i) % 12)).padStart(2,"0")}`,
      collections: [`SP ${program.name}`], programs: [program.name], initiatives: [],
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
console.log(`Generated ${Object.values(batches).flat().length} synthetic studies covering ${countries.length} map countries and all three programs.`);
