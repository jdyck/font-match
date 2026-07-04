import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORIES, FONTS, getFont } from "./fonts";
import type { FontCategory, FontMeta } from "./fonts";
import FontRow from "./FontRow";

interface Props {
  sampleText: string;
  setSampleText: (t: string) => void;
  activeFamily: string | null;
  setActiveFamily: (f: string | null) => void;
  favorites: string[];
  toggleFavorite: (family: string) => void;
}

const PAGE = 60;

export default function FontBrowser({
  sampleText,
  setSampleText,
  activeFamily,
  setActiveFamily,
  favorites,
  toggleFavorite,
}: Props) {
  const [query, setQuery] = useState("");
  const [cats, setCats] = useState<Set<FontCategory>>(new Set());
  const [latinOnly, setLatinOnly] = useState(true);
  const [limit, setLimit] = useState(PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FONTS.filter(
      (f) =>
        (!latinOnly || f.latin) &&
        (cats.size === 0 || cats.has(f.category)) &&
        (q === "" || f.family.toLowerCase().includes(q))
    );
  }, [query, cats, latinOnly]);

  // Reset paging whenever the filter changes.
  useEffect(() => setLimit(PAGE), [query, cats, latinOnly]);

  // Infinite scroll: reveal more rows as the sentinel approaches.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setLimit((l) => l + PAGE);
      },
      { rootMargin: "400px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered]);

  const toggleCat = (c: FontCategory) =>
    setCats((prev) => {
      const next = new Set(prev);
      next.has(c) ? next.delete(c) : next.add(c);
      return next;
    });

  const favFonts = favorites
    .map(getFont)
    .filter((f): f is FontMeta => Boolean(f));
  const visible = filtered.slice(0, limit);

  const rowProps = (f: FontMeta) => ({
    font: f,
    sampleText,
    isActive: f.family === activeFamily,
    isFavorite: favorites.includes(f.family),
    onSelect: () => setActiveFamily(f.family),
    onToggleFavorite: () => toggleFavorite(f.family),
  });

  return (
    <section className="browser">
      <div className="browser-controls">
        <textarea
          className="sample-input"
          value={sampleText}
          rows={1}
          placeholder="Type sample text… (press Enter for a new line)"
          onChange={(e) => setSampleText(e.target.value)}
        />
        <div className="filter-row">
          <input
            className="search-input"
            value={query}
            placeholder="Search fonts…"
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="chips">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                className={`chip ${cats.has(c.key) ? "chip--on" : ""}`}
                onClick={() => toggleCat(c.key)}
              >
                {c.label}
              </button>
            ))}
            <button
              className={`chip ${latinOnly ? "chip--on" : ""}`}
              title="Hide non-Latin (CJK, Arabic, Devanagari, …) families"
              onClick={() => setLatinOnly((v) => !v)}
            >
              Latin only
            </button>
          </div>
        </div>
        <div className="result-count">
          {filtered.length.toLocaleString()} fonts
          {favFonts.length > 0 && ` · ${favFonts.length} shortlisted`}
        </div>
      </div>

      <div className="font-list">
        {favFonts.length > 0 && (
          <>
            <div className="list-section">★ Shortlist</div>
            {favFonts.map((f) => (
              <FontRow key={`fav-${f.family}`} {...rowProps(f)} />
            ))}
            <div className="list-section">All fonts</div>
          </>
        )}

        {visible.map((f) => (
          <FontRow key={f.family} {...rowProps(f)} />
        ))}

        {visible.length < filtered.length && (
          <div ref={sentinelRef} className="sentinel">
            Loading more…
          </div>
        )}
        {filtered.length === 0 && (
          <div className="empty-list">No fonts match that search.</div>
        )}
      </div>
    </section>
  );
}
