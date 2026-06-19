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

export default function PieNode({ x, y, r, slices }) {
  const arcData = pieGenerator(slices);

  const arcGenerator = arc().innerRadius(0).outerRadius(r);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {arcData.map((d) => (
        <path
          key={d.data.label}
          d={arcGenerator(d)}
          fill={COLORS[d.data.label]}
          stroke="black"
        />
      ))}
    </g>
  );
}
