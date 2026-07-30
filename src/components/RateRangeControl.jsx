export default function RateRangeControl({
  lowerFraction,
  onLowerFractionChange,
  onAutoOptimize,
  isOptimizing = false,
  isOptimized = false,
  autoOptimizeDisabled = false,
}) {
  const lowerFractionPercent = Math.round(lowerFraction * 100);

  const buttonLabel = isOptimizing
    ? "計算中..."
    : isOptimized
      ? "計算済み"
      : "自動計算";

  return (
    <div className="rate-range-control">
      <div className="control-label">
        位置計算に使う易しい問題の割合
        <button
          type="button"
          className={`auto-optimize-button${isOptimized ? " auto-optimize-button--done" : ""}`}
          onClick={onAutoOptimize}
          disabled={autoOptimizeDisabled || isOptimizing}
          aria-label="自動最適化を計算"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="range-slider">
        <span>0%</span>

        <div className="range-slider-input">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={lowerFractionPercent}
            onChange={(e) => onLowerFractionChange(Number(e.target.value) / 100)}
            aria-label="位置計算に使う易しい問題の割合"
            aria-valuetext={`易しい順に${lowerFractionPercent}%の問題を使用`}
          />

          <output className="range-slider-value" style={{ left: `${lowerFractionPercent}%` }}>
            {lowerFractionPercent}%
          </output>
        </div>

        <span>100%</span>
      </div>
    </div>
  );
}
