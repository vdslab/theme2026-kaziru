import { useEffect, useRef, useState } from "react";

import UserIdInput from "./UserIdInput";
import RateRangeControl from "./RateRangeControl";
import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";

const MAX_CHART_ASPECT_RATIO = 3;

export default function Main({
  summary,
  allRows,
  lowerFraction,
  onLowerFractionChange,
  username,
  onUsernameChange,
  rate,
  rateLoading,
  rateError,
  onFetchRate,
  submissionsMap,
  submissionsLoaded,
  onFetchSubmissions,
  onAutoOptimize,
  isOptimizing,
  isOptimized,
}) {
  const [showCurrentRate, setShowCurrentRate] = useState(true);
  const [showProgressRing, setShowProgressRing] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [showPlacementSettings, setShowPlacementSettings] = useState(false);
  const [selectedAlgoName, setSelectedAlgoName] = useState(() =>
    summary.length > 0 ? summary[0].algo : null,
  );
  const [chartMinHeight, setChartMinHeight] = useState(0);
  const chartWrapperRef = useRef(null);
  const hasInitializedSelectionRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedSelectionRef.current && summary.length > 0) {
      hasInitializedSelectionRef.current = true;
      setSelectedAlgoName(summary[0].algo);
    }
  }, [summary]);

  useEffect(() => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    const observer = new ResizeObserver(([entry]) => {
      setChartMinHeight(Math.ceil(entry.contentRect.width / MAX_CHART_ASPECT_RATIO));
    });

    observer.observe(chartWrapper);
    return () => observer.disconnect();
  }, []);

  const selectedAlgo =
    selectedAlgoName != null
      ? (summary.find((item) => item.algo === selectedAlgoName) ?? null)
      : null;

  const problems = selectedAlgo
    ? allRows
        .filter((row) => row.tag === selectedAlgo.algo)
        .sort((a, b) => (a.diffCalc ?? 0) - (b.diffCalc ?? 0))
    : [];
  const progressByAlgorithm = new Map();
  for (const row of allRows) {
    const progress = progressByAlgorithm.get(row.tag) ?? {
      ac: 0,
      unsolved: 0,
      untried: 0,
    };

    if (submissionsMap.get(row.problem_id) === true) {
      progress.ac += 1;
    } else if (submissionsMap.has(row.problem_id)) {
      progress.unsolved += 1;
    } else {
      progress.untried += 1;
    }

    progressByAlgorithm.set(row.tag, progress);
  }

  return (
    <main className="main">
      <div className="control-pannel">
        <div className="control-pannel-inner">
          <div className="top-controls">
            <UserIdInput
              username={username}
              setUsername={onUsernameChange}
              handleFetchRate={onFetchRate}
              handleFetchSubmissions={onFetchSubmissions}
              rateError={rateError}
              isLoading={rateLoading}
            />

            <div className="top-controls-tools">
              <div className="display-options display-options--inline">
                <div className="control-label">表示オプション</div>
                <div className="checkboxes">
                  <label>
                    <input
                      type="checkbox"
                      checked={showCurrentRate}
                      onChange={(e) => setShowCurrentRate(e.target.checked)}
                    />
                    <span>現在レート線</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showProgressRing}
                      onChange={(e) => setShowProgressRing(e.target.checked)}
                    />
                    <span>AC状況</span>
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={showLabels}
                      onChange={(e) => setShowLabels(e.target.checked)}
                    />
                    <span>ラベル</span>
                  </label>
                </div>
              </div>

              <button
                className={`placement-settings-button${
                  showPlacementSettings ? " placement-settings-button--open" : ""
                }`}
                type="button"
                aria-expanded={showPlacementSettings}
                aria-controls="placement-settings"
                onClick={() => setShowPlacementSettings((current) => !current)}
              >
                配置設定
                <svg
                  aria-hidden="true"
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

            </div>
          </div>

          {showPlacementSettings && (
            <div id="placement-settings" className="control-section">
              <RateRangeControl
                lowerFraction={lowerFraction}
                onLowerFractionChange={onLowerFractionChange}
                onAutoOptimize={onAutoOptimize}
                isOptimizing={isOptimizing}
                isOptimized={isOptimized}
                autoOptimizeDisabled={!rate || !submissionsLoaded}
              />
            </div>
          )}
        </div>
      </div>

      <div className="visualization-container">
        <div className="chart-header">
          <div>
            <h1 className="chart-title">アルゴリズム分布図</h1>
          </div>
          <div className="chart-meta">
            <div className="current-rate">
              <span className="current-rate-label">
                <i aria-hidden="true" />
                現在のレート
              </span>
              <strong className="rate-value">
                {rateLoading ? "取得中..." : (rate ?? "未設定")}
              </strong>
            </div>
            {submissionsLoaded && (
              <div className="progress-ring-legend" aria-label="外側の円グラフの凡例">
                <span>
                  <i className="progress-ring-legend--ac" />
                  AC
                </span>
                <span>
                  <i className="progress-ring-legend--unsolved" />
                  WA
                </span>
                <span>
                  <i className="progress-ring-legend--untried" />
                  未挑戦
                </span>
              </div>
            )}
          </div>
        </div>

        <div
          className="vis-layout"
          style={chartMinHeight > 0 ? { minHeight: `${chartMinHeight}px` } : undefined}
        >
          <div ref={chartWrapperRef} className="chart-wrapper">
            <PieBeeswarm
              data={summary}
              rate={rate}
              showCurrentRate={showCurrentRate}
              showLabels={showLabels}
              progressByAlgorithm={progressByAlgorithm}
              showProgress={submissionsLoaded && showProgressRing}
              selectedAlgorithm={selectedAlgo?.algo ?? null}
              onSelectAlgorithm={setSelectedAlgoName}
            />
          </div>

          <AlgorithmCard algo={selectedAlgo} problems={problems} submissionsMap={submissionsMap} />
        </div>
      </div>
    </main>
  );
}
