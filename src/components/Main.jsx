import { useEffect, useRef, useState } from "react";

import { fetchUserRate } from "../api/loadUser";
import { fetchAllUserSubmissions } from "../api/loadUserSubmissions";
import { buildSubmissionMap } from "../utils/submissions";

import UserIdInput from "./UserIdInput";
import RateRangeControl from "./RateRangeControl";
import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";
import UsageOverlay from "./UsageOverlay";

const MAX_CHART_ASPECT_RATIO = 3;
export default function Main({ summary, allRows, lowerFraction, onLowerFractionChange }) {
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

  const openUsageOverlay = () => {
    setShowUsageOverlay(true);
  };

  const handleCloseUsageOverlay = () => {
    setShowUsageOverlay(false);
  };

  const [username, setUsername] = useState("");
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);

  const [submissionsMap, setSubmissionsMap] = useState(new Map());
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false);

  const handleUsernameChange = (value) => {
    setUsername(value);
    setRate(null);
    setRateError(null);
    setSubmissionsMap(new Map());
  };

  const handleFetchRate = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setRate(null);
      return;
    }

    setRateLoading(true);
    setRateError(null);
    setRate(null);
    try {
      const userRate = await fetchUserRate(trimmed);
      setRate(userRate);
    } catch (err) {
      setRate(null);
      setRateError(err.message);
    } finally {
      setRateLoading(false);
    }
  };

  const handleFetchSubmissions = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setSubmissionsMap(new Map());
      setSubmissionsLoaded(false);
      return;
    }

    setSubmissionsMap(new Map());
    setSubmissionsLoaded(false);
    try {
      const submissions = await fetchAllUserSubmissions(trimmed);
      const map = buildSubmissionMap(submissions);
      setSubmissionsMap(map);
      setSubmissionsLoaded(true);
    } catch {
      setSubmissionsLoaded(false);
      // エラー処理は今後必要に応じて実装
    }
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
      <div className="control-pannel">
        <div className="top-controls">
          <UserIdInput
            username={username}
            setUsername={handleUsernameChange}
            handleFetchRate={handleFetchRate}
            handleFetchSubmissions={handleFetchSubmissions}
            rateError={rateError}
          />

          <button className="usage-button" type="button" onClick={openUsageOverlay}>
            使い方
          </button>
        </div>

        <div className="control-section">
          <RateRangeControl
            lowerFraction={lowerFraction}
            onLowerFractionChange={onLowerFractionChange}
          />

          <div className="display-options">
            <div className="display-options-header">
              <div className="control-label">表示オプション</div>
            </div>
            <div className="checkboxes">
              <label>
                <input
                  type="checkbox"
                  checked={showCurrentRate}
                  onChange={(e) => setShowCurrentRate(e.target.checked)}
                />
                現在レート線を表示
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showProgressRing}
                  onChange={(e) => setShowProgressRing(e.target.checked)}
                />
                AC状況を表示
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                />
                ラベルを表示
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-container">
        <div className="chart-header">
          <h2 className="chart-title">アルゴリズム分布図（Pie-Beeswarm）</h2>
          <div className="current-rate">
            現在のレート
            <span className="rate-value">{rateLoading ? "取得中..." : (rate ?? "---")}</span>
          </div>
          {submissionsLoaded && (
            <div className="progress-ring-legend" aria-label="外側の円グラフの凡例">
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
            </div>
          )}
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
