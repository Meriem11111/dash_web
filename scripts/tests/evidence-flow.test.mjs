import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const root = new URL("../../", import.meta.url);
const modules = new Map();

// Exercise the actual TSX component without adding a test runner dependency.
function loadSource(relativePath) {
  if (modules.has(relativePath)) return modules.get(relativePath).exports;
  const filename = fileURLToPath(new URL(relativePath, root));
  const { outputText } = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2017 },
    fileName: filename,
  });
  const module = { exports: {} };
  modules.set(relativePath, module);
  const localRequire = name => name.startsWith("@/") ? loadSource(`${name.slice(2)}.ts`) : require(name);
  new Function("require", "module", "exports", outputText)(localRequire, module, module.exports);
  return module.exports;
}

const EvidenceFlow = loadSource("components/EvidenceFlow.tsx").default;
const countries = Array.from({ length: 12 }, (_, i) => `Country ${i + 1}`);
const principles = ["Diversity", "Efficiency", "Co-creation", "Recycling", "Resilience"];
const domains = ["Economic", "Environmental", "Social"];
const studies = Array.from({ length: 80 }, (_, i) => ({
  id: `study-${i}`,
  Countries: [countries[i % countries.length], countries[(i + 3) % countries.length]],
  Principles: i % 3 ? [principles[i % 5]] : [principles[i % 5], principles[(i + 1) % 5], principles[(i + 2) % 5]],
  Domains: i % 2 ? [domains[i % 3]] : [domains[i % 3], domains[(i + 1) % 3]],
}));
const props = { studies, colorLabels: principles, selected: { country: "All", principle: "All", domain: "All" }, onPick() {} };
const render = overrides => renderToStaticMarkup(createElement(EvidenceFlow, { ...props, ...overrides }));

for (const direction of [-1, 1]) {
  test(`chart markup survives ${direction < 0 ? "negative" : "positive"} runtime floating-point drift`, () => {
    const expected = render();
    const originalPow = Math.pow;
    let perturbed;
    try {
      // Model the tiny Math.pow differences between Node and browser engines
      // that affect d3-sankey's relaxation and triggered the hydration error.
      Math.pow = (base, exponent) => originalPow(base, exponent) + (base === 0.99 && exponent > 1 ? direction * Number.EPSILON : 0);
      perturbed = render();
    } finally {
      Math.pow = originalPow;
    }
    assert.ok(perturbed === expected, "Chart SVG markup changed between server and browser calculations");
    assert.match(expected, /class="flow-node" role="button"/);
    assert.match(expected, /Other countries/);
  });
}

test("empty and filtered chart states still render", () => {
  assert.match(render({ studies: [] }), /No evidence matches these filters/);
  const filtered = render({ studies: studies.slice(0, 1), selected: { ...props.selected, principle: "Diversity" } });
  assert.match(filtered, /aria-pressed="true"/);
  assert.doesNotMatch(filtered, /NaN|Infinity/);
});
