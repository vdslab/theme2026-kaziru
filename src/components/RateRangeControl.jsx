export default function RateRangeControl({
  lowerFraction,
  onLowerFractionChange,
  isAutoOptimize = false,
  optimalLowerFraction = null,
}) {
  const lowerFractionPercent = Math.round(lowerFraction * 100);
  const displayFraction = isAutoOptimize && optimalLowerFraction != null
    ? Math.round(optimalLowerFraction * 100)
    : lowerFractionPercent;

  return (
    <div className="rate-range-control">
      <div className="control-label">
        位置計算に使う易しい問題の割合
        {isAutoOptimize && (
          <span className="auto-optimize-badge">自動</span>
        )}
      </div>

      <div className="range-slider">
        <span>0%</span>

        <div className="range-slider-input">
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={displayFraction}
            onChange={(e) => onLowerFractionChange(Number(e.target.value) / 100)}
            disabled={isAutoOptimize}
            aria-label="位置計算に使う易しい問題の割合"
            aria-valuetext={`易しい順に${displayFraction}%の問題を使用${isAutoOptimize ? "（自動最適化中）" : ""}`}
          />

          <output className="range-slider-value" style={{ left: `${displayFraction}%` }}>
            {displayFraction}%
          </output>
        </div>

        <span>100%</span>
      </div>
    </div>
  );
}
