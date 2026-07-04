import fontsData from "./fonts.json";

export interface FontMeta {
  family: string;
  category: FontCategory;
  popularity: number;
  /** Latin-script family (kept when the "Latin only" filter is on). */
  latin: boolean;
  weights: number[];
  hasItalic: boolean;
  /** Variable weight axis [min, max], or null if the font is not variable. */
  wght: [number, number] | null;
  /** Variable width axis [min, max, default], or null. */
  wdth: [number, number, number] | null;
}

export type FontCategory =
  | "sans-serif"
  | "serif"
  | "display"
  | "handwriting"
  | "monospace"
  | "other";

export const FONTS = fontsData as FontMeta[];

export const CATEGORIES: { key: FontCategory; label: string }[] = [
  { key: "sans-serif", label: "Sans" },
  { key: "serif", label: "Serif" },
  { key: "display", label: "Display" },
  { key: "handwriting", label: "Script" },
  { key: "monospace", label: "Mono" },
];

const byFamily = new Map(FONTS.map((f) => [f.family, f]));
export const getFont = (family: string) => byFamily.get(family);

/** Weight in a font's available set that is closest to `target`. */
export function nearestWeight(font: FontMeta, target = 400): number {
  if (font.weights.includes(target)) return target;
  return font.weights.reduce((best, w) =>
    Math.abs(w - target) < Math.abs(best - target) ? w : best
  );
}
