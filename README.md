# Font Match

A local tool for matching a **Google Font** to the text in a mockup. Drop in a
mockup image (e.g. from ChatGPT), drag a live sample of any Google Font over the
mockup's heading, tune size/weight/tracking/color until the letterforms line up,
and star the winners into a shortlist.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

`npm run build` produces a static `dist/` you can host anywhere.

## How it works

- **Mockup:** drop, paste (⌘V), or upload an image. A draggable text box sits on
  top of it — grab it and slide it over the mockup's text to compare shapes.
- **Browse:** all ~1,900 Google Fonts, searchable and filterable by category
  (Sans / Serif / Display / Script / Mono). A **Latin only** filter (on by
  default) hides the ~580 non-Latin families (CJK, Arabic, Devanagari, …).
  Fonts load lazily as you scroll.
- **Compare:** click a font to apply it to the overlay. Adjust size, weight,
  tracking, line-height, color, and italic in the controls bar. For **variable
  fonts**, weight becomes a continuous slider and a **width** slider appears
  (applied via `font-stretch`).
- **Shortlist:** ★ any font to pin it to the top. Shortlist, sample text, and
  the active font persist in `localStorage`.

## Updating the font list

The bundled list lives in `src/fonts.json`, generated from Google's public
metadata endpoint (no API key). Refresh it any time with:

```bash
npm run fetch-fonts
```

Fonts themselves are pulled on demand from the Google Fonts CSS API at runtime.
