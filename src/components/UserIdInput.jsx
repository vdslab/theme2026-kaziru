export default function UserIdInput({
  username,
  setUsername,
  handleFetchRate,
  handleFetchSubmissions,
  rateError,
  isLoading = false,
}) {
  const handleSubmit = () => {
    handleFetchRate();
    handleFetchSubmissions();
  };

  return (
    <form
      className="username-bar"
      onSubmit={(event) => {
        event.preventDefault();
        handleSubmit();
      }}
    >
      <label className="username-field">
        <span className="username-label">AtCoder ユーザーID</span>
        <span className="username-input-wrap">
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
            <path d="M20 21a8 8 0 0 0-16 0" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <input
            className={`username-input${rateError ? " username-input--error" : ""}`}
            type="text"
            placeholder="例：tourist"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            aria-invalid={Boolean(rateError)}
            aria-describedby={rateError ? "username-error" : undefined}
            autoComplete="off"
          />
        </span>
      </label>
      <button
        className={`username-button${isLoading ? " username-button--loading" : ""}`}
        type="submit"
        disabled={isLoading || !username.trim()}
      >
        {isLoading ? "読み込み中" : "データを読み込む"}
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {isLoading ? (
            <circle cx="12" cy="12" r="8" />
          ) : (
            <path d="m9 18 6-6-6-6" />
          )}
        </svg>
      </button>
      {rateError && (
        <span id="username-error" className="username-error">
          {rateError}
        </span>
      )}
    </form>
  );
}
