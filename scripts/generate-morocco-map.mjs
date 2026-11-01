// Build the requested display boundary from the existing source polygons.
// Raw geographic and study source files remain unchanged.
import { readFile, writeFile } from "node:fs/promises";

const world = JSON.parse(await readFile(new URL("../data/world.json", import.meta.url), "utf8"));
const sources = ["MA", "EH"].map(code => world.features.find(feature => feature.properties.ISO_A2_EH === code));
if (sources.some(feature => feature?.geometry.type !== "Polygon" || feature.geometry.coordinates.length !== 1)) {
  throw new Error("Expected the two source polygons to have one exterior ring each.");
}

const pointKey = point => point.join(",");
const edges = new Map();
for (const feature of sources) {
  const ring = feature.geometry.coordinates[0];
  for (let index = 1; index < ring.length; index++) {
    const a = ring[index - 1], b = ring[index];
    if (pointKey(a) === pointKey(b)) continue;
    const key = [pointKey(a), pointKey(b)].sort().join("|");
    // Both polygons use identical vertices on their shared boundary.
    if (edges.has(key)) edges.delete(key);
    else edges.set(key, [a, b]);
  }
}

const neighbors = new Map();
for (const [a, b] of edges.values()) {
  for (const [from, to] of [[a, b], [b, a]]) {
    const key = pointKey(from);
    neighbors.set(key, [...(neighbors.get(key) ?? []), to]);
  }
}
if ([...neighbors.values()].some(points => points.length !== 2)) {
  throw new Error("The merged boundary is not a simple closed ring.");
}

const first = edges.values().next().value[0];
const ring = [first];
let previous;
let current = first;
do {
  const next = neighbors.get(pointKey(current)).find(point => pointKey(point) !== previous);
  previous = pointKey(current);
  current = next;
  ring.push(current);
  if (ring.length > edges.size + 1) throw new Error("Could not close the boundary.");
} while (pointKey(current) !== pointKey(first));
if (ring.length !== edges.size + 1) throw new Error("The boundary contains disconnected parts.");

const area = points => Math.abs(points.slice(1).reduce((sum, point, index) => {
  const before = points[index];
  return sum + before[0] * point[1] - point[0] * before[1];
}, 0) / 2);
const sourceArea = sources.reduce((sum, feature) => sum + area(feature.geometry.coordinates[0]), 0);
if (Math.abs(area(ring) - sourceArea) > 0.000001) throw new Error("The merged boundary changed the source area.");

const feature = {
  type: "Feature",
  properties: { name: "Morocco", ISO_A2_EH: "MA" },
  geometry: { type: "Polygon", coordinates: [ring] },
};
await writeFile(new URL("../data/map-morocco.json", import.meta.url), JSON.stringify(feature) + "\n");
console.log(`Generated Morocco display boundary: ${ring.length} vertices; source area preserved.`);
