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
          アルゴリズムごとの難易度分布と自身の解答状況を把握し、次に学ぶアルゴリズムや<br />
          取り組む問題を選択するためのツールです。以下の手順でご利用ください。
        </p>

        <div className="usage-steps">
          <div className="usage-step">
            <span className="usage-step-number">1</span>
            <div>
              <strong>ユーザーIDを入力</strong>
              <p>
                左上のユーザーID入力欄に自分のユーザーIDを入力すると、レートやAC状況が反映されます。
              </p>
            </div>
          </div>

          <div className="usage-step">
            <span className="usage-step-number">2</span>
            <div>
              <strong>AC状況を確認</strong>
              <p>
                IDを入力すると表示される円グラフ外側のリングは、AC状況を表しています。あなたが勉強不足のカテゴリを把握しましょう。
              </p>
            </div>
          </div>

          <div className="usage-step">
            <span className="usage-step-number">3</span>
            <div>
              <strong>アルゴリズムを選ぶ</strong>
              <p>
                分布図上の円グラフを選ぶと、右側のカードで選択したアルゴリズムの情報を確認できます。
              </p>
            </div>
          </div>

          <div className="usage-step">
            <span className="usage-step-number">4</span>
            <div>
              <strong>さっそく問題を解いてみよう！</strong>
              <p>
                右側のカードに表示される問題をクリックすると、AtCoderの問題ページに遷移します。目指したいレート帯の問題を解いて、レートアップを目指しましょう！
              </p>
            </div>
          </div>
        </div>

        <button className="usage-overlay-primary" type="button" onClick={onClose}>
          はじめる
        </button>
      </div>
    </div>
  );
}
