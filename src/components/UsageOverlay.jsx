export default function UsageOverlay({ onClose }) {
  return (
    <div className="usage-overlay-backdrop" onClick={onClose}>
      <div
        className="usage-overlay-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="usage-overlay-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="usage-overlay-close"
          type="button"
          onClick={onClose}
          aria-label="使い方を閉じる"
        >
          ×
        </button>

        <h3 id="usage-overlay-title" className="usage-overlay-title">
          はじめての方へ
        </h3>
        <p className="usage-overlay-text">
          このビューでは、アルゴリズム別の分布と自分のレートを同時に見ながら、
          どの帯でどんな問題が多いかを把握できます。
        </p>

        <div className="usage-steps">
          <div className="usage-step">
            <span className="usage-step-number">1</span>
            <div>
              <strong>レート帯を調整する</strong>
              <p>
                スライダーで、位置計算に使う易しい問題の割合を変えられます。
              </p>
            </div>
          </div>

          <div className="usage-step">
            <span className="usage-step-number">2</span>
            <div>
              <strong>表示内容を切り替える</strong>
              <p>
                現在レート線、AC状況、ラベルをオン・オフで切り替えられます。
              </p>
            </div>
          </div>

          <div className="usage-step">
            <span className="usage-step-number">3</span>
            <div>
              <strong>アルゴリズムを選ぶ</strong>
              <p>
                円グラフ上の要素を選ぶと、右側のカードでそのアルゴリズムの情報を確認できます。
              </p>
            </div>
          </div>
        </div>

        <button
          className="usage-overlay-primary"
          type="button"
          onClick={onClose}
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
