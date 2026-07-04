import { useEffect, useState } from "react";
import { getFont } from "./fonts";
import { loadFontFull } from "./fontLoader";
import { usePersistedState } from "./usePersistedState";
import MockupPanel from "./MockupPanel";
import FontBrowser from "./FontBrowser";

export interface OverlaySettings {
  x: number;
  y: number;
  size: number;
  weight: number;
  /** Width axis value (%), applied via font-stretch. 100 = normal. */
  width: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
  italic: boolean;
}

const DEFAULT_OVERLAY: OverlaySettings = {
  x: 40,
  y: 40,
  size: 48,
  weight: 400,
  width: 100,
  color: "#111111",
  letterSpacing: 0,
  lineHeight: 1.2,
  italic: false,
};

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

export default function App() {
  const [mockupSrc, setMockupSrc] = useState<string | null>(null);
  const [sampleText, setSampleText] = usePersistedState(
    "fp:sampleText",
    "The quick brown fox"
  );
  const [activeFamily, setActiveFamily] = usePersistedState<string | null>(
    "fp:activeFamily",
    null
  );
  const [favorites, setFavorites] = usePersistedState<string[]>(
    "fp:favorites",
    []
  );
  const [overlay, setOverlay] = useState<OverlaySettings>(DEFAULT_OVERLAY);

  // When the active font changes, load its full (variable) ranges and reconcile
  // the overlay's weight/width with what the font actually supports.
  useEffect(() => {
    if (!activeFamily) return;
    const font = getFont(activeFamily);
    if (!font) return;
    loadFontFull(font);

    setOverlay((o) => {
      const weight = font.wght
        ? clamp(o.weight, font.wght[0], font.wght[1])
        : font.weights.includes(o.weight)
          ? o.weight
          : font.weights.includes(400)
            ? 400
            : font.weights[0];
      const width = font.wdth ? clamp(o.width, font.wdth[0], font.wdth[1]) : 100;
      return weight === o.weight && width === o.width
        ? o
        : { ...o, weight, width };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFamily]);

  const toggleFavorite = (family: string) =>
    setFavorites((favs) =>
      favs.includes(family)
        ? favs.filter((f) => f !== family)
        : [...favs, family]
    );

  return (
    <div className="app">
      <header className="topbar">
        <h1>Font Picker</h1>
        <span className="tagline">
          Match a Google Font to your mockup — overlay, compare, shortlist.
        </span>
      </header>

      <main className="layout">
        <MockupPanel
          mockupSrc={mockupSrc}
          setMockupSrc={setMockupSrc}
          sampleText={sampleText}
          activeFamily={activeFamily}
          overlay={overlay}
          setOverlay={setOverlay}
        />
        <FontBrowser
          sampleText={sampleText}
          setSampleText={setSampleText}
          activeFamily={activeFamily}
          setActiveFamily={setActiveFamily}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  );
}
