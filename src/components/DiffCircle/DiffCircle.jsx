const BAND_COLORS = {
    "0-399": "#808080",
    "400-799": "#804000",
    "800-1199": "#008000",
    "1200-1599": "#00C0C0",
    "1600-1999": "#0000FF",
    "2000-2399": "#C0C000",
    "2400-2799": "#FF8000",
    "2800-3199": "#FF0000",
};

export default function DiffCircle({ difficulty, diffBand }) {
    const hasDifficulty = difficulty != null && diffBand;


    let ratio = 0;
    let color = "#ccc";
    if (hasDifficulty) {
        const [low, high] = diffBand.split("-").map(Number);
        const bandRange = high - low;
        const clamped = Math.max(low, Math.min(high, difficulty));
        ratio = bandRange > 0 ? (clamped - low) / bandRange : 0;
        color = BAND_COLORS[diffBand] || "#808080";
    }

    const size = 14;
    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 1;
    const clipId = `diff-clip-${Math.random().toString(36).slice(2, 8)}`;

    const filledHeight = ratio * size;
    const fillY = size - filledHeight;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="diff-circle"
            style={{ flexShrink: 0, display: "block" }}
        >
            <defs>
                <clipPath id={clipId}>
                    <circle cx={cx} cy={cy} r={r} />
                </clipPath>
            </defs>
            <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={hasDifficulty ? color : "#d0d0d0"}
                strokeWidth="1"
            />
            {hasDifficulty && (
                <rect
                    x={0}
                    y={fillY}
                    width={size}
                    height={filledHeight}
                    fill={color}
                    clipPath={`url(#${clipId})`}
                />
            )}
        </svg>
    );
}
