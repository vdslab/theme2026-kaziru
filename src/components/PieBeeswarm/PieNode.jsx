import { pie, arc } from "d3-shape";

const COLORS = {
  Gray: "#808080",
  Brown: "#804000",
  Green: "#008001",
  Cyan: "#00C0C0",
  Blue: "#0000FF",
};

const PROGRESS_COLORS = {
  AC: "#22c55e",
  Unsolved: "#f59e0b",
  Untried: "#cbd5e1",
};

const pieGenerator = pie()
  .value((d) => d.value)
  .sort(null)
  .endAngle(-Math.PI * 2 - Math.PI / 2);

export default function PieNode({
  x,
  y,
  r,
  slices,
  progressSlices = [],
  showProgress = false,
  progressRingGap = 4,
  progressRingWidth = 12,
  label,
  selected = false,
  dimmed = false,
  onSelect,
}) {
  const arcData = pieGenerator(slices);
  const progressArcData =
    showProgress && progressSlices.some((slice) => slice.value > 0)
      ? pieGenerator(progressSlices.filter((slice) => slice.value > 0))
      : [];

  // リングの外周は従来のノード半径に固定し、難易度Pieはその内側に収める。
  // 小さいノードでPieが潰れないよう、リング幅・間隔は半径に応じて縮める。
  const ringWidth = showProgress ? Math.min(progressRingWidth / 2, r * 0.2) : 0;
  const ringGap = showProgress ? Math.min(progressRingGap, r * 0.12) : 0;
  const innerPieRadius = showProgress ? Math.max(1, r - ringGap - ringWidth) : r;
  const outerRadius = r;
  const arcGenerator = arc().innerRadius(0).outerRadius(innerPieRadius);
  const progressArcGenerator = arc()
    .innerRadius(innerPieRadius + ringGap)
    .outerRadius(outerRadius);
  const strokeColor = "black";
  const strokeWidth = 1;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  };

  const opacity = dimmed ? 0.6 : 1;

  return (
    <g
      className={`pie-node${selected ? " pie-node--selected" : ""}`}
      opacity={opacity}
      transform={`translate(${x}, ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={(event) => {
        event.stopPropagation();
        onSelect?.();
      }}
      onKeyDown={handleKeyDown}
    >
      {progressArcData.map((d) => (
        <path
          key={`progress-${d.data.label}`}
          className="pie-node-progress"
          d={progressArcGenerator(d)}
          fill={PROGRESS_COLORS[d.data.label]}
          stroke="white"
          strokeWidth={1}
        >
          <title>{`${d.data.label}: ${d.data.value}`}</title>
        </path>
      ))}
      {arcData.map((d) => (
        <path
          key={d.data.label}
          d={arcGenerator(d)}
          fill={COLORS[d.data.label]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      ))}
      <circle r={outerRadius + 6} fill="transparent" />
    </g>
  );
}
