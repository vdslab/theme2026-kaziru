import { useEffect, useRef, useState } from "react";

import ControlPannel from "./ControlPannel";
import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";
import UsageOverlay from "./UsageOverlay";

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
  isAutoOptimize,
  onAutoOptimizeChange,
  optimalLowerFraction,
}) {
  const [showCurrentRate, setShowCurrentRate] = useState(true);
  const [showProgressRing, setShowProgressRing] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [selectedAlgoName, setSelectedAlgoName] = useState(() =>
    summary.length > 0 ? summary[0].algo : null,
  );
  const [chartMinHeight, setChartMinHeight] = useState(0);
  const [showUsageOverlay, setShowUsageOverlay] = useState(true);
  const chartWrapperRef = useRef(null);

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
      </div>
    </main>
  );
}
