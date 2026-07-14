export default function UserIdInput({
  username,
  setUsername,
  handleFetchRate,
  handleFetchSubmissions,
  rateError,
}) {
  return (
    <div className="username-bar">
      <input
        className={`username-input${rateError ? " username-input--error" : ""}`}
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleFetchRate();
            handleFetchSubmissions();
          }
        }}
      />
      <button
        className="username-button"
        onClick={() => {
          handleFetchRate();
          handleFetchSubmissions();
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>
      {rateError && <span className="username-error">{rateError}</span>}
    </div>
  );
}
