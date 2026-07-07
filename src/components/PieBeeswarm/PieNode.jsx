import { pie, arc } from "d3-shape";

const COLORS = {
  Gray: "#808080",
  Brown: "#804000",
  Green: "#008001",
  Cyan: "#00C0C0",
  Blue: "#0000FF",
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
  label,
  selected = false,
  onSelect,
}) {
  const arcData = pieGenerator(slices);

  const arcGenerator = arc().innerRadius(0).outerRadius(r);
  const strokeColor = selected ? "#2563eb" : "black";
  const strokeWidth = selected ? 4 : 1;

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect?.();
    }
  };

  return (
    <g
      className={`pie-node${selected ? " pie-node--selected" : ""}`}
      transform={`translate(${x}, ${y})`}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={selected}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {arcData.map((d) => (
        <path
          key={d.data.label}
          d={arcGenerator(d)}
          fill={COLORS[d.data.label]}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      ))}
      <circle r={r + 6} fill="transparent" />
    </g>
  );
}
