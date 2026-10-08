import { useEffect, useMemo, useRef, useState } from "react";

import ControlPannel from "./ControlPannel";
import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";
import { createPeerProgressMap, getPeerRatingBand } from "../utils/peerBaselines";

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
  peerBaselines,
  onFetchSubmissions,
  onAutoOptimize,
  isOptimizing,
  isOptimized,
}) {
  const [showCurrentRate, setShowCurrentRate] = useState(true);
  const [showProgressRing, setShowProgressRing] = useState(true);
  const [showPeerProgressRing, setShowPeerProgressRing] = useState(true);
  const [peerStatistic, setPeerStatistic] = useState("mean");
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

  const handleCloseUsageOverlay = () => {
    setShowUsageOverlay(false);
  };

  const selectedAlgo =
    selectedAlgoName != null
      ? (summary.find((item) => item.algo === selectedAlgoName) ?? null)
      : null;

  const problems = selectedAlgo
    ? allRows
        .filter((row) => row.tag === selectedAlgo.algo)
        .sort((a, b) => (a.diffCalc ?? 0) - (b.diffCalc ?? 0))
    : [];
  const peerRatingBand = useMemo(
    () => getPeerRatingBand(peerBaselines, rate),
    [peerBaselines, rate],
  );
  const peerProgressByAlgorithm = useMemo(
    () => createPeerProgressMap(peerRatingBand, peerStatistic),
    [peerRatingBand, peerStatistic],
  );
  const showPeerProgress = showPeerProgressRing && peerProgressByAlgorithm.size > 0;
  const peerStatisticLabel = peerStatistic === "median" ? "中央値" : "平均";
  const showPersonalProgress = submissionsLoaded && showProgressRing;
  const showProgressLegend = showPersonalProgress || showPeerProgress;
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
      {showUsageOverlay && <UsageOverlay onClose={handleCloseUsageOverlay} />}

      <ControlPannel
        lowerFraction={lowerFraction}
        onLowerFractionChange={onLowerFractionChange}
        username={username}
        onUsernameChange={onUsernameChange}
        rate={rate}
        rateLoading={rateLoading}
        rateError={rateError}
        onFetchRate={onFetchRate}
        submissionsLoaded={submissionsLoaded}
        onFetchSubmissions={onFetchSubmissions}
        isAutoOptimize={isAutoOptimize}
        onAutoOptimizeChange={onAutoOptimizeChange}
        optimalLowerFraction={optimalLowerFraction}
        showCurrentRate={showCurrentRate}
        showProgressRing={showProgressRing}
        showLabels={showLabels}
        setShowCurrentRate={setShowCurrentRate}
        setShowProgressRing={setShowProgressRing}
        setShowLabels={setShowLabels}
      />

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
                      checked={showPeerProgressRing}
                      onChange={(e) => setShowPeerProgressRing(e.target.checked)}
                    />
                    <span>同レート帯リング</span>
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
                <div
                  className={`peer-statistic-control${
                    showPeerProgressRing ? "" : " peer-statistic-control--disabled"
                  }`}
                  role="radiogroup"
                  aria-label="同レート帯リングの集計方法"
                >
                  <span className="peer-statistic-control-label">外周</span>
                  <div className="peer-statistic-toggle">
                    <label>
                      <input
                        type="radio"
                        name="peer-statistic"
                        value="mean"
                        checked={peerStatistic === "mean"}
                        disabled={!showPeerProgressRing}
                        onChange={(e) => setPeerStatistic(e.target.value)}
                      />
                      <span>平均</span>
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="peer-statistic"
                        value="median"
                        checked={peerStatistic === "median"}
                        disabled={!showPeerProgressRing}
                        onChange={(e) => setPeerStatistic(e.target.value)}
                      />
                      <span>中央値</span>
                    </label>
                  </div>
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
            <p className="chart-eyebrow">LEARNING MAP</p>
            <h1 className="chart-title">アルゴリズム分布マップ</h1>
            <p className="chart-description">
              円を選択すると、アルゴリズムごとの難易度と問題一覧を確認できます。
            </p>
          </div>
          <div className="chart-meta">
            {showProgressLegend && (
              <div className="progress-ring-legend" aria-label="進捗リングの凡例">
                {showPersonalProgress && (
                  <>
                    <span>
                      <i className="progress-ring-legend--ac" />
                      AC
                    </span>
                    <span>
                      <i className="progress-ring-legend--unsolved" />
                      未AC
                    </span>
                    <span>
                      <i className="progress-ring-legend--untried" />
                      未挑戦
                    </span>
                  </>
                )}
                {showPeerProgress && (
                  <span>
                    <i className="progress-ring-legend--peer" />
                    同レート帯{peerStatisticLabel}AC・外周（{peerRatingBand.lower}–
                    {peerRatingBand.upper}）
                  </span>
                )}
              </div>
            )}
            <div className="current-rate">
              <span className="current-rate-label">
                <i aria-hidden="true" />
                現在のレート
              </span>
              <strong className="rate-value">
                {rateLoading ? "取得中..." : (rate ?? "未設定")}
              </strong>
            </div>
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
              showProgress={showPersonalProgress}
              peerProgressByAlgorithm={peerProgressByAlgorithm}
              showPeerProgress={showPeerProgress}
              peerStatisticLabel={peerStatisticLabel}
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
