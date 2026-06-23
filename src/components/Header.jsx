export default function Header() {
    return (
        <header className="header">
            <div className="header-left">
                <div className="logo">kaziru</div>
                <div className="tagline">アルゴリズム学習を、可視化で最適化する</div>
            </div>
            <div className="header-right">
                <div className="current-rate">現在のレート <span className="rate-value">1234</span></div>
            </div>
        </header>
    );
}
