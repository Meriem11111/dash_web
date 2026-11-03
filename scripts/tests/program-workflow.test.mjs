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
const allStudies = await getStudies();

for (const program of programs) {
  test(`${program.name}: overview → populated picker → selected dashboard → edit selection`, async () => {
    const overview = await ProgramPage({ params: Promise.resolve({ slug: program.slug }) });
    assert.ok(renderToStaticMarkup(overview).includes(`/innovations?program=${program.slug}`));

    const page = await InnovationsPage({ searchParams: Promise.resolve({ program: program.slug }) });
    const picker = page.props.children.find(child => child.type === StudySelector);
    const studies = picker.props.studies;
    assert.ok(studies.length >= 100, "Each collection needs a populated study picker");
    assert.ok(new Set(studies.flatMap(s => s.Countries)).size >= 116, "Each collection needs map coverage");
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
