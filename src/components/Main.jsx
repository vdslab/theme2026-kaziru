import { useEffect, useRef, useState } from "react";

import { fetchUserRate } from "../api/loadUser";
import { fetchAllUserSubmissions } from "../api/loadUserSubmissions";
import { buildSubmissionMap } from "../utils/submissions";

import UserIdInput from "./UserIdInput";
import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";

const MAX_CHART_ASPECT_RATIO = 3;

const MOCK_ALGORITHM = {
  algo: "累積和",
  median: 820,
  n: 53,
};

export default function Main({ summary, allRows }) {
  const [rateThreshold, setRateThreshold] = useState(0);
  const [showCurrentRate, setShowCurrentRate] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [selectedAlgoName, setSelectedAlgoName] = useState(() =>
    summary.length > 0 ? summary[0].algo : null,
  );
  const [chartMinHeight, setChartMinHeight] = useState(0);
  const [chartSize, setChartSize] = useState({
    width: 0,
    height: 0,
  });
  const chartWrapperRef = useRef(null);

  useEffect(() => {
    const chartWrapper = chartWrapperRef.current;
    if (!chartWrapper) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;

      setChartSize({ width, height });
      setChartMinHeight(Math.ceil(width / MAX_CHART_ASPECT_RATIO));
    });

    observer.observe(chartWrapper);
    return () => observer.disconnect();
  }, []);

  const [username, setUsername] = useState("");
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);

  const [submissionsMap, setSubmissionsMap] = useState(new Map());

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
      return;
    }

    setSubmissionsMap(new Map());
    try {
      const submissions = await fetchAllUserSubmissions(trimmed);
      const map = buildSubmissionMap(submissions);
      setSubmissionsMap(map);
    } catch {
      // エラー処理は今後必要に応じて実装
    }
  };

  const hasUsername = username.trim().length > 0;

  const selectedAlgo =
    summary.find((item) => item.algo === selectedAlgoName) ??
    summary?.[0] ??
    MOCK_ALGORITHM;

  const problems = allRows
    .filter((row) => row.tag === selectedAlgo.algo)
    .sort((a, b) => (a.diffCalc ?? 0) - (b.diffCalc ?? 0));

  return (
    <main className="main">
      <UserIdInput
        username={username}
        setUsername={setUsername}
        handleFetchRate={handleFetchRate}
        handleFetchSubmissions={handleFetchSubmissions}
        rateError={rateError}
      />
      <div className="controls-panel">
        <div className="rate-range-control">
          <div className="control-label">
            表示するレート帯の下限値（出現レート帯の中央値）
          </div>
          <div className="range-slider">
            <span>0</span>
            <input
              type="range"
              min="0"
              max="2000"
              value={rateThreshold}
              onChange={(e) => setRateThreshold(Number(e.target.value))}
            />
            <span>2000</span>
          </div>
        </div>

        <div className="display-options">
          <div className="display-options-header">
            <div className="control-label">表示オプション</div>
            <button className="reset-button">🔄 リセット</button>
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
                checked={showRecommended}
                onChange={(e) => setShowRecommended(e.target.checked)}
              />
              推奨探索帯を表示
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

      <div className="visualization-container">
        <div className="chart-header">
          <h2 className="chart-title">アルゴリズム分布図（Pie-Beeswarm）</h2>
          <div className="current-rate">
            現在のレート
            <span className="rate-value">
              {rateLoading ? "取得中..." : (rate ?? "---")}
            </span>
          </div>
          <button className="usage-button">使い方</button>
        </div>

        <div
          className="vis-layout"
          style={
            chartMinHeight > 0
              ? { minHeight: `${chartMinHeight}px` }
              : undefined
          }
        >
          <div ref={chartWrapperRef} className="chart-wrapper">
            <PieBeeswarm
              data={summary}
              rate={rate}
              hasUsername={hasUsername}
              showCurrentRate={showCurrentRate}
              showRecommended={showRecommended}
              showLabels={showLabels}
              selectedAlgorithm={selectedAlgo.algo}
              onSelectAlgorithm={setSelectedAlgoName}
              width={chartSize.width}
              height={chartSize.height}
            />
          </div>

          <AlgorithmCard
            algo={selectedAlgo}
            problems={problems}
            submissionsMap={submissionsMap}
          />
        </div>
      </div>
    </main>
  );
}
