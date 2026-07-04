// Downloads the full Google Fonts family list (no API key required) and writes
// a trimmed src/fonts.json used by the app. Re-run with: npm run fetch-fonts
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "../src/fonts.json");
const SRC = "https://fonts.google.com/metadata/fonts";

// Google's metadata categories -> the short keys the UI filters on.
const CATEGORY_MAP = {
  "Sans Serif": "sans-serif",
  Serif: "serif",
  Display: "display",
  Handwriting: "handwriting",
  Monospace: "monospace",
};

const raw = await fetch(SRC).then((r) => {
  if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
  return r.text();
});
// The endpoint occasionally prefixes JSON with an XSSI guard; strip it.
const json = JSON.parse(raw.replace(/^\)\]\}'?\s*/, ""));

const axisRange = (axes, tag) => {
  const a = axes.find((x) => x.tag === tag);
  return a && a.max > a.min ? a : null;
};

const fonts = json.familyMetadataList.map((f) => {
  const variants = Object.keys(f.fonts);
  const weights = [
    ...new Set(variants.map((v) => parseInt(v, 10))),
  ].sort((a, b) => a - b);
  const wght = axisRange(f.axes, "wght");
  const wdth = axisRange(f.axes, "wdth");
  return {
    family: f.family,
    category: CATEGORY_MAP[f.category] ?? "other",
    popularity: f.popularity ?? 99999,
    // Latin-script fonts (the vast majority). Non-Latin families carry a
    // primaryScript code (Jpan, Arab, Deva, …) and are hidden by default.
    latin: !f.primaryScript || f.primaryScript === "Latn",
    weights,
    hasItalic: variants.some((v) => v.endsWith("i")),
    // Variable-axis ranges, when the font actually varies along that axis.
    wght: wght ? [wght.min, wght.max] : null,
    wdth: wdth ? [wdth.min, wdth.max, wdth.defaultValue] : null,
  };
});

// Stable, useful default order: most popular first.
fonts.sort((a, b) => a.popularity - b.popularity);

await writeFile(OUT, JSON.stringify(fonts));
const latinCount = fonts.filter((f) => f.latin).length;
console.log(
  `Wrote ${fonts.length} fonts to ${OUT} (${latinCount} Latin, ` +
    `${fonts.filter((f) => f.wght).length} variable-weight, ` +
    `${fonts.filter((f) => f.wdth).length} variable-width)`
);
