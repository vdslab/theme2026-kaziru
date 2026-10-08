import UserIdInput from "./UserIdInput";
import RateRangeControl from "./RateRangeControl";

export default function ControlPannel({
  username,
  onUsernameChange,
  rateLoading,
  rateError,
  onFetchRate,
  onFetchSubmissions,
  showCurrentRate,
  onShowCurrentRateChange,
  showProgressRing,
  onShowProgressRingChange,
  showPeerProgressRing,
  onShowPeerProgressRingChange,
  showLabels,
  onShowLabelsChange,
  peerStatistic,
  onPeerStatisticChange,
  showPlacementSettings,
  onShowPlacementSettingsChange,
  lowerFraction,
  onLowerFractionChange,
  onAutoOptimize,
  isOptimizing,
  isOptimized,
  rate,
  submissionsLoaded,
}) {
  return (
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
                    onChange={(e) => onShowCurrentRateChange(e.target.checked)}
                  />
                  <span>現在レート線</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showProgressRing}
                    onChange={(e) => onShowProgressRingChange(e.target.checked)}
                  />
                  <span>AC状況</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showPeerProgressRing}
                    onChange={(e) => onShowPeerProgressRingChange(e.target.checked)}
                  />
                  <span>同レート帯リング</span>
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => onShowLabelsChange(e.target.checked)}
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
                      onChange={(e) => onPeerStatisticChange(e.target.value)}
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
                      onChange={(e) => onPeerStatisticChange(e.target.value)}
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
              onClick={() => onShowPlacementSettingsChange((current) => !current)}
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
  );
}
