// Exact vector RGB colors extracted from the user's colorRef.pdf.
export const referencePalette = {
  charcoal: "#232326",
  slate: "#30383f",
  mint: "#00ffcc",
  turquoise: "#00a888",
  deepTeal: "#008e99",
  aqua: "#00e0b5",
  paleMint: "#8dffe9",
  cyan: "#14e6e6",
  blue: "#596bff",
  violet: "#4928ff",
  periwinkle: "#9ba6ff",
  paleBlue: "#bdc4ff",
  lavender: "#b6a9ff",
  paleLavender: "#dbd4ff",
  gray: "#e4e4e9",
} as const;

export const evidencePalette = [
  referencePalette.turquoise, referencePalette.blue, referencePalette.deepTeal,
  referencePalette.periwinkle, referencePalette.aqua, referencePalette.lavender,
  "#30c1d7", "#00bf99", referencePalette.paleBlue, referencePalette.violet,
  referencePalette.paleMint, referencePalette.paleLavender, referencePalette.cyan,
];
