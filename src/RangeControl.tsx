import { useEffect, useState } from "react";

interface Props {
  label: string;
  /** Suffix shown after the number field, e.g. "px" or "%". */
  unit?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/**
 * A range slider paired with a typeable number field. Drag for exploration,
 * type (or use the spinner arrows) for exact values. The number field keeps a
 * local text buffer so partial input isn't clobbered mid-typing; it commits
 * live when in range and clamps on blur.
 */
export default function RangeControl({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: Props) {
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = parseFloat(text);
    if (isNaN(n)) setText(String(value));
    else onChange(clamp(n, min, max));
  };

  return (
    <div className="control">
      <div className="control-head">
        <label>{label}</label>
        <div className="num-wrap">
          <input
            type="number"
            className="num"
            min={min}
            max={max}
            step={step}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              const n = parseFloat(e.target.value);
              if (!isNaN(n) && n >= min && n <= max) onChange(n);
            }}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") e.currentTarget.blur();
            }}
          />
          {unit && <span className="num-unit">{unit}</span>}
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
      />
    </div>
  );
}
