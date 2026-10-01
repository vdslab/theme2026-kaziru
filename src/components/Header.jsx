export default function Header({ onOpenUsage }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-left">
          <div>
            <div className="logo">AtCompass</div>
          </div>
        </div>
        <button className="usage-button header-usage-button" type="button" onClick={onOpenUsage}>
          <svg
            aria-hidden="true"
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 2-3 4" />
            <path d="M12 18h.01" />
          </svg>
          使い方
        </button>
      </div>
    </header>
  );
}
