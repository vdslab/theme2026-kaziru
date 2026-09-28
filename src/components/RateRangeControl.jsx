import { useState, useId } from "react";

export default function RateRangeControl({
  lowerFraction,
  onLowerFractionChange,
  onAutoOptimize,
  isOptimizing = false,
  isOptimized = false,
  autoOptimizeDisabled = false,
}) {
  const lowerFractionPercent = Math.round(lowerFraction * 100);

  const buttonLabel = isOptimizing ? "計算中..." : isOptimized ? "計算済み" : "自動計算";

  const [isExpanded, setIsExpanded] = useState(true);
  const contentId = useId();

  return (
    <div className="rate-range-control">
      <div className="rate-range-control-header control-label" style={{ margin: "0 20px" }}>
        <button
          type="button"
          className="rate-range-control-toggle"
          onClick={() => setIsExpanded((prev) => !prev)}
          aria-expanded={isExpanded}
          aria-controls={contentId}
          aria-label={isExpanded ? "問題の範囲を折りたたむ" : "問題の範囲を展開する"}
        >
          <svg
            className="rate-range-control-chevron"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div
        id={contentId}
        className={`rate-range-control-content ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      >
        配置計算に使用する問題の範囲
        <button
          type="button"
          className={`auto-optimize-button${isOptimized ? " auto-optimize-button--done" : ""}`}
          onClick={onAutoOptimize}
          disabled={autoOptimizeDisabled || isOptimizing || isOptimized}
          aria-label="自動最適化を計算"
        >
          {buttonLabel}
        </button>
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
              style={{ "--range-progress": `${lowerFractionPercent}%` }}
              aria-label="配置計算に使用する問題の範囲"
              aria-valuetext={`易しい順に${lowerFractionPercent}%の問題を使用`}
            />

            <output className="range-slider-value" style={{ left: `${lowerFractionPercent}%` }}>
              {lowerFractionPercent}%
            </output>
          </div>

          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
