import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const require = createRequire(import.meta.url);
const modules = new Map();
function loadSource(name) {
  if (modules.has(name)) return modules.get(name).exports;
  const { outputText } = ts.transpileModule(readFileSync(new URL(`../../${name}.ts`, import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  });
  const module = { exports: {} };
  modules.set(name, module);
  new Function("require", "module", "exports", outputText)(name => name.startsWith("@/") ? loadSource(name.slice(2)) : require(name), module, module.exports);
  return module.exports;
}
const { createMapLevels, studyCountColor, isMapColor } = loadSource("lib/mapColorScale");
const { referencePalette } = loadSource("lib/referencePalette");

function luminance(hex) {
  const rgb = [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16) / 255)
    .map(channel => channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
}

test("the default and reset soften the original reference palette with its own neutrals", () => {
  const referenceColors = [referencePalette.deepTeal, referencePalette.turquoise, referencePalette.aqua, referencePalette.paleMint];
  const levels = createMapLevels();
  for (const [index, color] of referenceColors.entries()) {
    for (const channel of [1, 3, 5]) {
      const base = parseInt(color.slice(channel, channel + 2), 16);
      const gray = parseInt(referencePalette.gray.slice(channel, channel + 2), 16);
      const slate = parseInt(referencePalette.slate.slice(channel, channel + 2), 16);
      const actual = parseInt(levels[index].color.slice(channel, channel + 2), 16);
      assert.ok(actual > Math.min(base, gray, slate) && actual < Math.max(base, gray, slate));
      assert.ok(Math.abs(actual - base) < 65, `${color}: keep the reference color recognizable`);
    }
  }
  createMapLevels("#ff3366");
  assert.deepEqual(createMapLevels(null), createMapLevels());
  for (const value of ["red", "#fff", "#zzzzzz", "", undefined]) {
    assert.equal(isMapColor(value), false);
    assert.deepEqual(createMapLevels(value), createMapLevels());
  }
});

test("study count boundaries match the same legend bins for every chosen color", () => {
  for (const color of [null, "#ff0000", "#4928ff"]) {
    const levels = createMapLevels(color);
    const expected = [[-1, 4], [0, 4], [1, 3], [4, 3], [5, 2], [11, 2], [12, 1], [24, 1], [25, 0], [1000, 0]];
    for (const [count, index] of expected) assert.equal(studyCountColor(count, levels), levels[index].color);
    assert.deepEqual(levels.map(level => level.min), [25, 12, 5, 1, 0]);
    assert.equal(studyCountColor(0, levels), referencePalette.gray);
  }
});

test("default, reference hues and extreme colors produce muted, distinct, ordered shades", () => {
  for (const color of [null, ...Object.values(referencePalette), "#000000", "#ffffff", "#ffffee", "#010102"]) {
    const levels = createMapLevels(color);
    const shades = levels.slice(0, 4).map(level => level.color);
    assert.ok(shades.every(isMapColor), color);
    assert.equal(new Set(shades).size, 4, color);
    for (const shade of shades) {
      const channels = [1, 3, 5].map(index => parseInt(shade.slice(index, index + 2), 16) / 255);
      const max = Math.max(...channels);
      const min = Math.min(...channels);
      const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(max + min - 1));
      assert.ok(saturation <= .65, `${color}: ${shade} must stay softened`);
    }
    for (let i = 1; i < shades.length; i++) {
      assert.ok(luminance(shades[i]) > luminance(shades[i - 1]), `${color}: lower counts must have lighter shades`);
    }
    assert.equal(levels[4].color, referencePalette.gray);
  }
});

test("changing the chosen hue changes all positive-count fills", () => {
  const teal = createMapLevels("#008e99");
  const violet = createMapLevels("#4928ff");
  for (const count of [1, 5, 12, 25]) assert.notEqual(studyCountColor(count, teal), studyCountColor(count, violet));
  assert.equal(studyCountColor(0, teal), studyCountColor(0, violet));
});
