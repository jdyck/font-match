// Injects Google Fonts CSS2 <link> tags on demand. No API key needed.
// Each distinct request URL is loaded at most once.
import type { FontMeta } from "./fonts";

const loaded = new Set<string>();

const encName = (family: string) =>
  encodeURIComponent(family).replace(/%20/g, "+");

function inject(url: string): void {
  if (loaded.has(url)) return;
  loaded.add(url);
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}

/** Load a single static weight of a family — used for the browser previews. */
export function loadFont(family: string, weights: number[]): void {
  const wght = [...weights].sort((a, b) => a - b).join(";");
  inject(
    `https://fonts.googleapis.com/css2?family=${encName(family)}:wght@${wght}&display=swap`
  );
}

/**
 * Load the font applied to the overlay, requesting the full variable ranges it
 * supports (continuous weight and/or width) so the sliders can interpolate.
 * Non-variable fonts fall back to their discrete instances.
 */
export function loadFontFull(font: FontMeta): void {
  // Weight occupies one axis position: a range for variable fonts, otherwise
  // the list of discrete instances.
  const wghtTokens = font.wght
    ? [`${font.wght[0]}..${font.wght[1]}`]
    : font.weights.map(String);

  let axisSpec: string;
  if (font.wdth) {
    // Axis tags must be listed alphabetically: wdth before wght.
    const wdthRange = `${font.wdth[0]}..${font.wdth[1]}`;
    const tuples = wghtTokens.map((w) => `${wdthRange},${w}`);
    axisSpec = `wdth,wght@${tuples.join(";")}`;
  } else {
    axisSpec = `wght@${wghtTokens.join(";")}`;
  }

  inject(
    `https://fonts.googleapis.com/css2?family=${encName(font.family)}:${axisSpec}&display=swap`
  );
}
