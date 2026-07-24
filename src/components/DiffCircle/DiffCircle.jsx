import { useState, useRef, useCallback, useId } from "react";
import { BAND_COLORS } from "../../utils/diffColors";

const TOOLTIP_DELAY_MS = 200;
const TOOLTIP_OFFSET_Y = 2;

export default function DiffCircle({ difficulty, diffBand }) {
  const hasDifficulty = difficulty != null && diffBand;
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const timerRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleMouseEnter = useCallback(() => {
    if (!hasDifficulty) return;
    timerRef.current = setTimeout(() => {
      if (wrapperRef.current) {
        const rect = wrapperRef.current.getBoundingClientRect();
        setTooltipStyle({
          position: "fixed",
          left: rect.left + rect.width / 2,
          top: rect.top - TOOLTIP_OFFSET_Y,
          transform: "translate(-50%, -100%)",
        });
      }
      setShowTooltip(true);
    }, TOOLTIP_DELAY_MS);
  }, [hasDifficulty]);

  const handleMouseLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setShowTooltip(false);
  }, []);

  let ratio = 0;
  let color = "#ccc";
  if (hasDifficulty) {
    const [low, high] = diffBand.split("-").map(Number);
    const bandRange = high - low;
    const clamped = Math.max(low, Math.min(high, difficulty));
    ratio = bandRange > 0 ? (clamped - low) / bandRange : 0;
    color = BAND_COLORS[diffBand] || "#808080";
  }

  const size = 14;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 1;
  const clipId = `diff-clip-${useId()}`;

  const filledHeight = ratio * size;
  const fillY = size - filledHeight;

  return (
    <span
      ref={wrapperRef}
      className="diff-circle-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="diff-circle"
        style={{ flexShrink: 0, display: "block" }}
      >
        <defs>
          <clipPath id={clipId}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        <g>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="transparent"
            stroke={hasDifficulty ? color : "#d0d0d0"}
            strokeWidth="1"
          />
          {hasDifficulty && (
            <rect
              x={0}
              y={fillY}
              width={size}
              height={filledHeight}
              fill={color}
              clipPath={`url(#${clipId})`}
            />
          )}
        </g>
      </svg>
      {showTooltip && (
        <span
          className="diff-circle-tooltip"
          style={tooltipStyle}
        >{`difficulty: ${difficulty}`}</span>
      )}
    </span>
  );
}
