export default function AxisBottom({ yMin, yMax, ticks, axisXMin, axisXMax }) {
  return (
    <g>
      <line x1={axisXMin} x2={axisXMax} y1={yMax} y2={yMax} stroke="black" />
      <line x1={axisXMin} x2={axisXMax} y1={yMin} y2={yMin} stroke="black" />

      {ticks.map((tick, index) => {
        const isEdge = index === 0 || index === ticks.length - 1;
        return (
          <g key={tick.value} transform={`translate(${tick.position},0)`}>
            <line y1={yMin} y2={yMax + 10} stroke={isEdge ? "black" : "gray"} />
            <text y={yMax + 25} textAnchor="middle" fontSize={12}>
              {tick.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}
