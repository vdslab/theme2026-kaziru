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
  rate,
  rateLoading,
  submissionsMap,
  submissionsLoaded,
  peerBaselines,
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
            <ControlPannel
              showCurrentRate={showCurrentRate}
              onShowCurrentRateChange={setShowCurrentRate}
              showProgressRing={showProgressRing}
              onShowProgressRingChange={setShowProgressRing}
              showPeerProgressRing={showPeerProgressRing}
              onShowPeerProgressRingChange={setShowPeerProgressRing}
              showLabels={showLabels}
              onShowLabelsChange={setShowLabels}
              peerStatistic={peerStatistic}
              onPeerStatisticChange={setPeerStatistic}
              showPlacementSettings={showPlacementSettings}
              onShowPlacementSettingsChange={setShowPlacementSettings}
              lowerFraction={lowerFraction}
              onLowerFractionChange={onLowerFractionChange}
              onAutoOptimize={onAutoOptimize}
              isOptimizing={isOptimizing}
              isOptimized={isOptimized}
              rate={rate}
              submissionsLoaded={submissionsLoaded}
            />

            <div className="chart-content">
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
          </div>

          <AlgorithmCard algo={selectedAlgo} problems={problems} submissionsMap={submissionsMap} />
        </div>
      </div>
    </main>
  );
}
