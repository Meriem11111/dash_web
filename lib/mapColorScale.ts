import { referencePalette } from "@/lib/referencePalette";

export type MapLevel = { min: number; color: string; label: string };

/** Soften the reference colors with the palette's own neutrals. */
function softenMapColor(color: string): string {
  const channel = (index: number) => {
    const base = parseInt(color.slice(index, index + 2), 16);
    const gray = parseInt(referencePalette.gray.slice(index, index + 2), 16);
    const slate = parseInt(referencePalette.slate.slice(index, index + 2), 16);
    return Math.round(base * .65 + gray * .25 + slate * .10).toString(16).padStart(2, "0");
  };
  return `#${channel(1)}${channel(3)}${channel(5)}`;
}

const defaultLevels: MapLevel[] = [
  { min: 25, color: softenMapColor(referencePalette.deepTeal), label: "25+" },
  { min: 12, color: softenMapColor(referencePalette.turquoise), label: "12 – 24" },
  { min: 5, color: softenMapColor(referencePalette.aqua), label: "5 – 11" },
  { min: 1, color: softenMapColor(referencePalette.paleMint), label: "1 – 4" },
  { min: 0, color: referencePalette.gray, label: "No studies" },
];

export const isMapColor = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

/** Keep the selected hue muted, with progressively lighter shades for lower counts. */
export function createMapLevels(color?: string | null): MapLevel[] {
  if (!isMapColor(color)) return defaultLevels;
  const [r, g, b] = [1, 3, 5].map(index => parseInt(color.slice(index, index + 2), 16) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : Math.min(.70, delta / (1 - Math.abs(2 * lightness - 1)));
  let hue = 0;
  if (delta !== 0) {
    hue = max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
    hue = (hue * 60 + 360) % 360;
  }
  // Bound the darkest shade so even very pale or near-black choices stay legible.
  const darkest = Math.max(.22, Math.min(.48, lightness));
  const shades = [darkest, darkest + (.9 - darkest) * .36, darkest + (.9 - darkest) * .68, .9];
  const hexFor = (light: number) => {
    const a = saturation * Math.min(light, 1 - light);
    const channel = (n: number) => {
      const k = (n + hue / 30) % 12;
      const value = light - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(value * 255).toString(16).padStart(2, "0");
    };
    return softenMapColor(`#${channel(0)}${channel(8)}${channel(4)}`);
  };
  return defaultLevels.map((level, index) => ({ ...level, color: index < shades.length ? hexFor(shades[index]) : level.color }));
}

export function studyCountColor(count: number, levels: MapLevel[]): string {
  return (levels.find(level => count >= level.min) ?? levels[levels.length - 1]).color;
}
