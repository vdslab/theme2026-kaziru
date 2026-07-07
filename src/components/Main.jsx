import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import AlgorithmCard from "./AlgorithmCard";
import { useEffect, useState } from "react";

const MOCK_ALGORITHM = {
  algo: "累積和",
  median: 820,
  n: 53,
};

export default function Main({ summary, allRows, rate, rateLoading, rateError }) {
  const [rateThreshold, setRateThreshold] = useState(0);
  const [showCurrentRate, setShowCurrentRate] = useState(true);
  const [showRecommended, setShowRecommended] = useState(true);
  const [showLabels, setShowLabels] = useState(false);
  const [selectedAlgoName, setSelectedAlgoName] = useState(null);

  useEffect(() => {
    if (summary.length === 0) {
      setSelectedAlgoName(null);
      return;
    }

    setSelectedAlgoName((current) =>
      current && summary.some((item) => item.algo === current)
        ? current
        : summary[0].algo,
    );
  }, [summary]);

  const selectedAlgo =
    summary.find((item) => item.algo === selectedAlgoName) ??
    summary?.[0] ??
    MOCK_ALGORITHM;

  const problems = allRows
    .filter((row) => row.tag === selectedAlgo.algo);
    
  return (
    <main className="main">
      <div className="controls-panel">
        <div className="rate-range-control">
          <div className="control-label">表示するレート帯の下限値（出現レート帯の中央値）</div>
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

        <div className="vis-layout">
          <div className="chart-wrapper">
            <PieBeeswarm
              data={summary}
              showCurrentRate={showCurrentRate}
              showRecommended={showRecommended}
              showLabels={showLabels}
              selectedAlgorithm={selectedAlgo.algo}
              onSelectAlgorithm={setSelectedAlgoName}
            />
          </div>

          <AlgorithmCard algo={selectedAlgo} problems={problems} />
        </div>
      </div>
    </main>
  );
}
