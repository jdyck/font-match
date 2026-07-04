import { useEffect, useRef, useState } from "react";
import type { OverlaySettings } from "./App";
import { getFont } from "./fonts";
import RangeControl from "./RangeControl";

interface Props {
  mockupSrc: string | null;
  setMockupSrc: (src: string | null) => void;
  sampleText: string;
  activeFamily: string | null;
  overlay: OverlaySettings;
  setOverlay: React.Dispatch<React.SetStateAction<OverlaySettings>>;
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MockupPanel({
  mockupSrc,
  setMockupSrc,
  sampleText,
  activeFamily,
  overlay,
  setOverlay,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const activeFont = activeFamily ? getFont(activeFamily) : undefined;

  const loadImageFile = async (file: File | null | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setMockupSrc(await fileToDataUrl(file));
  };

  // Paste an image straight from the clipboard (great for ChatGPT mockups).
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = [...(e.clipboardData?.items ?? [])].find((i) =>
        i.type.startsWith("image/")
      );
      if (item) loadImageFile(item.getAsFile());
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Drag the overlay text around the stage.
  const startDrag = (e: React.PointerEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const offsetX = e.clientX - rect.left - overlay.x;
    const offsetY = e.clientY - rect.top - overlay.y;

    const move = (ev: PointerEvent) => {
      setOverlay((o) => ({
        ...o,
        x: ev.clientX - rect.left - offsetX,
        y: ev.clientY - rect.top - offsetY,
      }));
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const patch = (p: Partial<OverlaySettings>) =>
    setOverlay((o) => ({ ...o, ...p }));

  return (
    <section className="mockup-panel">
      <div
        ref={stageRef}
        className={`stage ${dragOver ? "stage--dragover" : ""} ${
          mockupSrc ? "" : "stage--empty"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          loadImageFile(e.dataTransfer.files[0]);
        }}
      >
        {mockupSrc ? (
          <img src={mockupSrc} alt="mockup" className="mockup-img" draggable={false} />
        ) : (
          <div className="stage-hint">
            Drop, paste, or upload a mockup — or just play with the text.
          </div>
        )}

        <div
          className="overlay-text"
          onPointerDown={startDrag}
          style={{
            left: overlay.x,
            top: overlay.y,
            fontFamily: activeFamily ? `'${activeFamily}'` : "sans-serif",
            fontSize: overlay.size,
            fontWeight: overlay.weight,
            fontStretch: `${overlay.width}%`,
            fontStyle: overlay.italic ? "italic" : "normal",
            color: overlay.color,
            letterSpacing: `${overlay.letterSpacing}px`,
            lineHeight: overlay.lineHeight,
          }}
        >
          {sampleText || "Sample text"}
        </div>
      </div>

      <div className="overlay-controls">
        <div className="control">
          <label>Font</label>
          <span className="active-font">{activeFamily ?? "— pick one →"}</span>
        </div>
        <RangeControl
          label="Size"
          unit="px"
          min={8}
          max={200}
          step={1}
          value={overlay.size}
          onChange={(v) => patch({ size: v })}
        />
        {activeFont?.wght ? (
          <RangeControl
            label="Weight"
            min={activeFont.wght[0]}
            max={activeFont.wght[1]}
            step={1}
            value={overlay.weight}
            onChange={(v) => patch({ weight: v })}
          />
        ) : (
          <div className="control">
            <label>Weight</label>
            <select
              value={overlay.weight}
              onChange={(e) => patch({ weight: +e.target.value })}
              disabled={!activeFont}
            >
              {(activeFont?.weights ?? [400]).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        )}
        {activeFont?.wdth && (
          <RangeControl
            label="Width"
            unit="%"
            min={activeFont.wdth[0]}
            max={activeFont.wdth[1]}
            step={0.5}
            value={overlay.width}
            onChange={(v) => patch({ width: v })}
          />
        )}
        <RangeControl
          label="Tracking"
          unit="px"
          min={-5}
          max={20}
          step={0.5}
          value={overlay.letterSpacing}
          onChange={(v) => patch({ letterSpacing: v })}
        />
        <RangeControl
          label="Line height"
          min={0.8}
          max={2.5}
          step={0.05}
          value={overlay.lineHeight}
          onChange={(v) => patch({ lineHeight: v })}
        />
        <div className="control control--inline">
          <label>Color</label>
          <input
            type="color"
            value={overlay.color}
            onChange={(e) => patch({ color: e.target.value })}
          />
        </div>
        <div className="control control--inline">
          <label>Italic</label>
          <input
            type="checkbox"
            checked={overlay.italic}
            disabled={!activeFont?.hasItalic}
            onChange={(e) => patch({ italic: e.target.checked })}
          />
        </div>
        <label className="btn btn--ghost">
          {mockupSrc ? "Replace image…" : "Add image…"}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => loadImageFile(e.target.files?.[0])}
          />
        </label>
        {mockupSrc && (
          <button className="btn btn--ghost" onClick={() => setMockupSrc(null)}>
            Clear image
          </button>
        )}
      </div>
    </section>
  );
}
