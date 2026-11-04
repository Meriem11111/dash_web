import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
const mocks = new Map([
  ["next/navigation", { useRouter: () => ({ push() {} }), notFound() { throw new Error("Not found"); }, redirect(url) { throw new Error(`Redirect: ${url}`); } }],
  ["next/link", { default: ({ children, ...props }) => createElement("a", props, children) }],
  ["@/components/SiteHeader", { default: () => null }],
  ["@/components/dashboard", { default: () => null }],
]);
for (const mock of mocks.values()) mock.__esModule = true;
function loadSource(name) {
  if (modules.has(name)) return modules.get(name).exports;
  const filename = ["ts", "tsx"].map(ext => new URL(`../../${name}.${ext}`, import.meta.url)).find(existsSync);
  if (!filename) throw new Error(`Missing module: ${name}`);
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017, esModuleInterop: true },
    fileName: filename.pathname,
  });
  const module = { exports: {} };
  modules.set(name, module);
  new Function("require", "module", "exports", outputText)(
    dependency => mocks.get(dependency) ?? (dependency.startsWith("@/") ? loadSource(dependency.slice(2)) : require(dependency)),
    module, module.exports,
  );
  return module.exports;
}

const { programs } = loadSource("lib/programs");
const { getStudies } = loadSource("lib/getStudies");
const ProgramPage = loadSource("app/programs/[slug]/page").default;
const InnovationsPage = loadSource("app/innovations/page").default;
const DashboardPage = loadSource("app/dashboard/page").default;
const StudySelector = loadSource("components/StudySelector").default;
const EvidenceFlow = loadSource("components/EvidenceFlow").default;
const allStudies = await getStudies();
const world = JSON.parse(readFileSync(new URL("../../data/world.json", import.meta.url), "utf8"));
const regions = JSON.parse(readFileSync(new URL("../../data/map-regions.json", import.meta.url), "utf8"));
const regionCodes = new Set(Object.values(regions).join(" ").split(" "));
const mapCountryNames = new Set(world.features
  .filter(f => regionCodes.has(f.properties.ISO_A2_EH) && f.properties.ISO_A2_EH !== "EH")
  .map(f => f.properties.name));
const uncoveredCountries = countries => [...mapCountryNames].filter(name => !countries.has(name)).sort();
const africanCountries = new Set(world.features
  .filter(f => regions.Africa.split(" ").includes(f.properties.ISO_A2_EH) && f.properties.ISO_A2_EH !== "EH")
  .map(f => f.properties.name));

test("simulated evidence has uneven country coverage and focused, data-driven connections", () => {
  const countryStudies = new Map();
  for (const study of allStudies) {
    for (const country of study.Countries) {
      countryStudies.set(country, [...(countryStudies.get(country) ?? []), study]);
    }
  }
  const allPrinciples = new Set(allStudies.flatMap(s => s.Principles));
  assert.deepEqual(uncoveredCountries(countryStudies), ["Eritrea", "Guyana"], "Only two displayed countries have no studies");
  assert.ok([...countryStudies.keys()].every(name => mapCountryNames.has(name)), "All study locations match the displayed map");
  assert.ok(new Set([...countryStudies.values()].map(studies => studies.length)).size > 5, "Study volumes must vary");
  const principleBreadths = new Set();
  const domainBreadths = new Set();
  for (const [country, studies] of countryStudies) {
    const simulated = studies.filter(s => s.Mock);
    const principleCount = new Set(simulated.flatMap(s => s.Principles)).size;
    const domainCount = new Set(simulated.flatMap(s => s.Domains)).size;
    assert.ok(principleCount >= 1 && principleCount <= 4, `${country}: a focused but variable principle portfolio`);
    assert.ok(domainCount >= 1 && domainCount <= 4, `${country}: a focused but variable domain portfolio`);
    principleBreadths.add(principleCount);
    domainBreadths.add(domainCount);
  }
  assert.deepEqual([...principleBreadths].sort(), [1, 2, 3, 4], "Countries range from one to four principles");
  assert.deepEqual([...domainBreadths].sort(), [1, 2, 3, 4], "Countries range from one to four impact domains");
  assert.deepEqual([...new Set(countryStudies.get("Jordan").flatMap(s => s.Principles))], ["Efficiency"]);
  assert.deepEqual([...new Set(countryStudies.get("Jordan").flatMap(s => s.Domains))], ["Environment"]);
  assert.equal(new Set(countryStudies.get("Kenya").flatMap(s => s.Principles)).size, 4);
  assert.equal(new Set(countryStudies.get("Kenya").flatMap(s => s.Domains)).size, 3);
  const africanShare = allStudies.filter(s => s.Countries.some(c => africanCountries.has(c))).length / allStudies.length;
  assert.ok(africanShare >= .70, "At least 70% of the preview studies focus on Africa");
  const topCountries = [...countryStudies].sort((a, b) => b[1].length - a[1].length).slice(0, 10);
  assert.ok(topCountries.every(([country]) => africanCountries.has(country)), "African countries lead the default flow diagram");

  const selected = { country: "All", principle: "All", domain: "All" };
  const renderFlow = studies => renderToStaticMarkup(createElement(EvidenceFlow, {
    studies, selected, colorLabels: [...allPrinciples],
  }));
  const morocco = countryStudies.get("Morocco");
  assert.ok(morocco.length >= 43, "Preserve the focused Morocco examples");
  assert.deepEqual([...new Set(morocco.flatMap(s => s.Principles))].sort(), ["Diversity", "Efficiency"]);
  const moroccoFlow = renderFlow(morocco);
  const efficiencyCount = morocco.filter(s => s.Principles.includes("Efficiency")).length;
  assert.ok(moroccoFlow.includes(`Morocco → Efficiency: ${efficiencyCount.toFixed(2)} weighted study contributions`));
  assert.match(moroccoFlow, /Diversity → Economic: [\d.]+ weighted study contributions/);
  assert.doesNotMatch(moroccoFlow, /Recycling|Efficiency → Social/);

  const brazilFlow = renderFlow(countryStudies.get("Brazil"));
  assert.match(brazilFlow, /Diversity → Environment: [\d.]+ weighted study contributions/);
  assert.match(brazilFlow, /Recycling → Environment: [\d.]+ weighted study contributions/);
  assert.doesNotMatch(brazilFlow, /Efficiency|Economic|Social/);
  assert.equal(allStudies.filter(s => !s.Mock).length, 1, "Retain the supplied research record");
  assert.deepEqual(allStudies.find(s => !s.Mock).Domains.slice().sort(), ["Economic", "Environment", "Human Condition", "Productivity"], "Never trim the real record to fit simulated profiles");
});

for (const program of programs) {
  test(`${program.name}: overview → populated picker → selected dashboard → edit selection`, async () => {
    const overview = await ProgramPage({ params: Promise.resolve({ slug: program.slug }) });
    assert.ok(renderToStaticMarkup(overview).includes(`/innovations?program=${program.slug}`));

    const page = await InnovationsPage({ searchParams: Promise.resolve({ program: program.slug }) });
    const picker = page.props.children.find(child => child.type === StudySelector);
    const studies = picker.props.studies;
    assert.ok(studies.length >= 3, "Each collection needs enough studies to exercise selection");
    const countries = new Set(studies.flatMap(s => s.Countries));
    assert.deepEqual(uncoveredCountries(countries), ["Eritrea", "Guyana"], "Every program covers the map except the two no-data examples");
    assert.ok(studies.filter(s => s.Countries.some(c => africanCountries.has(c))).length / studies.length >= .65, "Every program emphasizes African studies");
    for (const field of ["Principles", "Domains"]) {
      const breadths = [...countries].map(country => new Set(studies.filter(s => s.Mock && s.Countries.includes(country)).flatMap(s => s[field])).size);
      assert.deepEqual([...new Set(breadths)].sort(), [1, 2, 3, 4], `${field} breadth varies within each program view`);
    }
    assert.ok(studies.every(s => s.Url && s.Scale && s.Principles.length && s.Domains.length));
    const markup = renderToStaticMarkup(picker);
    assert.ok(markup.includes('class="selection-table"'));
    assert.ok(markup.includes(`Select ${studies[0].Title}`));
    assert.ok(!markup.includes("Program studies are not available yet"));

    const selectedIds = studies.slice(0, 3).map(s => s.id);
    const foreignStudy = allStudies.find(s => !studies.some(own => own.id === s.id));
    const query = new URLSearchParams({ program: program.slug });
    selectedIds.forEach(id => query.append("study", id));
    // The real dashboard route must ignore a study from another program.
    query.append("study", foreignStudy.id);
    const searchParams = { program: query.get("program"), study: query.getAll("study") };
    const dashboard = await DashboardPage({ searchParams: Promise.resolve(searchParams) });
    assert.equal(dashboard.props.programSlug, program.slug);
    assert.equal(dashboard.props.selected, true);
    assert.deepEqual(dashboard.props.studies.map(s => s.id), selectedIds);

    const restored = await InnovationsPage({ searchParams: Promise.resolve(searchParams) });
    const restoredPicker = restored.props.children.find(child => child.type === StudySelector);
    const restoredMarkup = renderToStaticMarkup(restoredPicker);
    assert.ok(restoredMarkup.includes("Ready to explore the connections"));
    assert.equal((restoredMarkup.match(/checked=""/g) ?? []).length, 3);
  });
}
