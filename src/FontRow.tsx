import { useEffect, useRef, useState } from "react";
import type { FontMeta } from "./fonts";
import { nearestWeight } from "./fonts";
import { loadFont } from "./fontLoader";

interface Props {
  font: FontMeta;
  sampleText: string;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export default function FontRow({
  font,
  sampleText,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  // Only fetch a font's CSS once the row scrolls near the viewport.
  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadFont(font.family, [nearestWeight(font, 400)]);
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [font, visible]);

  return (
    <div
      ref={ref}
      className={`font-row ${isActive ? "font-row--active" : ""}`}
      onClick={onSelect}
    >
      <div className="font-row-head">
        <span className="font-name">{font.family}</span>
        <button
          className={`star ${isFavorite ? "star--on" : ""}`}
          title={isFavorite ? "Remove from shortlist" : "Add to shortlist"}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
        >
          {isFavorite ? "★" : "☆"}
        </button>
      </div>
      <div
        className="font-sample"
        style={{
          fontFamily: visible ? `'${font.family}'` : "inherit",
          fontWeight: nearestWeight(font, 400),
        }}
      >
        {sampleText || "The quick brown fox"}
      </div>
    </div>
  );
}
