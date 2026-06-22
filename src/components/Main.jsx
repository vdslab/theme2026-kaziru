import PieBeeswarm from "./PieBeeswarm/PieBeeswarm";
import { useState } from "react";

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

  const mockAlgo = summary?.[0] ?? MOCK_ALGORITHM;

  const problems = allRows
    .filter((row) => row.tag === mockAlgo.algo)
    .slice(0, 10);

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
          <button className="info-button">ⓘ</button>
          <button className="usage-button">使い方</button>
        </div>

        <div className="vis-layout">
          <div className="chart-wrapper">
            <PieBeeswarm
              data={summary}
              showCurrentRate={showCurrentRate}
              showRecommended={showRecommended}
            />
          </div>

          <div className="legend">
            <div className="legend-title">選択したアルゴリズム</div>
            <div className="selected-algo-card">
              <div className="selected-algo-header">
                <div className="algorithm-icon">Σ</div>
                <div className="selected-algo-name">{mockAlgo.algo}</div>
              </div>
              <div className="selected-algo-stats">
                <div className="stat-row">
                  <span className="stat-label">出現レート帯の中央値</span>
                  <span className="stat-value">{Math.round(mockAlgo.median)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">問題数</span>
                  <span className="stat-value">{mockAlgo.n} 問</span>
                </div>
              </div>
              <div className="problems-list">
                <div className="problems-list-title">問題一覧（上位10件）</div>
                {problems.map((problem, i) => (
                  <a
                    key={i}
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="problem-item"
                  >
                    <span className="problem-id">{problem.problem_id}</span>
                    <span className="problem-title">{problem.title}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
