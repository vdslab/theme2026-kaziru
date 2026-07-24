export default function RateRangeControl({ lowerFraction, onLowerFractionChange }) {
  const lowerFractionPercent = Math.round(lowerFraction * 100);

  return (
    <div className="rate-range-control">
      <div className="control-label">位置計算に使う易しい問題の割合</div>

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
