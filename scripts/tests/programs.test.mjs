import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
function loadSource(name) {
  if (modules.has(name)) return modules.get(name).exports;
  const source = readFileSync(new URL(`../../${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  });
  const module = { exports: {} };
  modules.set(name, module);
  new Function("require", "module", "exports", outputText)(
    name => name.startsWith("@/") ? loadSource(name.slice(2)) : require(name),
    module, module.exports,
  );
  return module.exports;
}

const { programs, findProgram, matchesCollection, publicationUrl, programLabel } = loadSource("lib/programs");
const { scopeStudies } = loadSource("lib/studyScope");
const expected = {
  agroecology: "1a25a23b-4434-47fb-99a7-441d55a32b60",
  "aquatic-foods": "92545c45-6347-4bbd-b4ba-b34c05ab2120",
  "excellence-in-agronomy": "a80d1192-d4d2-41d0-a544-724f12b86757",
  "livestock-and-climate": "b7af7bd2-aae5-47a1-a92b-765805d71c64",
  "mixed-farming-systems": "661628f6-daf3-48ac-ae21-41f9ba51b7f8",
  "nature-positive-solutions": "746e468c-8182-4086-a620-2ed8623f8cab",
  "nexus-gains": "89fa7aa2-a43c-4cf8-b38c-a6823e06a980",
  "sustainable-animal-productivity": "e7f27bd3-aad0-418c-8145-a2e06aa6d6f1",
  "multifunctional-landscapes": "32ac7c8f-6874-4c3a-83b0-6223934600ca",
  "sustainable-animal-and-aquatic-foods": "246d18a3-fdff-4f05-a918-94b617dc158e",
  "sustainable-farming": "906d7b6e-625e-4fa4-8022-9e8e6804232a",
};

test("all 11 requested collections have unique routes and their exact CGSpace links", () => {
  assert.deepEqual(Object.fromEntries(programs.map(p => [p.slug, p.collection])), expected);
  assert.equal(new Set(programs.map(p => p.collection)).size, 11);
  assert.equal(programs.filter(p => p.kind === "initiative").length, 8);
  for (const [slug, collection] of Object.entries(expected)) {
    assert.equal(publicationUrl(findProgram(slug)), `https://cgspace.cgiar.org/collections/${collection}/search`);
  }
  assert.equal(findProgram("unknown"), undefined);
});

for (const program of programs) {
  test(`${program.name}: exported names, UUIDs and slugs select only this collection`, () => {
    const label = programLabel(program);
    const aliases = [program.collection, program.slug, program.name, `${label} on ${program.name}`,
      program.kind === "initiative" ? `Initiative ${program.name}` : `SP ${program.name}`];
    for (const alias of aliases) {
      assert.ok(matchesCollection(`  ${alias.toUpperCase().replaceAll(" ", "   ")}  `, program), alias);
    }
    const records = programs.map(p => ({ id: p.slug, Collections: [`${programLabel(p)} on ${p.name}`] }));
    assert.deepEqual(scopeStudies(records, program).map(s => s.id), [program.slug]);
    const foreignIds = programs.filter(p => p !== program).map(p => p.slug);
    assert.deepEqual(scopeStudies(records, program, foreignIds), []);
    assert.deepEqual(scopeStudies(records, program, [program.slug]).map(s => s.id), [program.slug]);
  });
}

test("shared collection membership appears in both views and once in the general dashboard", () => {
  const [initiative] = programs;
  const scienceProgram = findProgram("sustainable-farming");
  const records = [
    { id: "shared", Collections: [initiative.collection, `SP ${scienceProgram.name}`] },
    { id: "unassigned", Collections: [] },
  ];
  assert.deepEqual(scopeStudies(records, initiative).map(s => s.id), ["shared"]);
  assert.deepEqual(scopeStudies(records, scienceProgram).map(s => s.id), ["shared"]);
  assert.equal(scopeStudies(records).length, 2);
});
