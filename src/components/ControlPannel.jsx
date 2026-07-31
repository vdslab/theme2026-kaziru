import UserIdInput from "./UserIdInput";
import RateRangeControl from "./RateRangeControl";

export default function ControlPannel({
  lowerFraction,
  onLowerFractionChange,
  username,
  onUsernameChange,
  rate,
  rateLoading,
  rateError,
  onFetchRate,
  submissionsLoaded,
  onFetchSubmissions,
  isAutoOptimize,
  onAutoOptimizeChange,
  optimalLowerFraction,
  showCurrentRate,
  showProgressRing,
  showLabels,
  setShowCurrentRate,
  setShowProgressRing,
  setShowLabels,
}) {
  const openUsageOverlay = () => {
    setShowUsageOverlay(true);
  };

  return (
    <div className="control-pannel">
      <div className="top-controls">
        <UserIdInput
          username={username}
          setUsername={onUsernameChange}
          handleFetchRate={onFetchRate}
          handleFetchSubmissions={onFetchSubmissions}
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
          isAutoOptimize={isAutoOptimize}
          optimalLowerFraction={optimalLowerFraction}
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
            <label>
              <input
                type="checkbox"
                checked={isAutoOptimize}
                onChange={(e) => onAutoOptimizeChange(e.target.checked)}
                disabled={!rate || !submissionsLoaded}
              />
              自動最適化
            </label>
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
      </div>
    </div>
  );
}
