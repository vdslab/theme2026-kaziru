export default function AxisBottom({ yMin, yMax, ticks, axisXMin, axisXMax }) {
  return (
    <g className="chart-axis">
      <line className="chart-axis-boundary" x1={axisXMin} x2={axisXMax} y1={yMax} y2={yMax} />
      <line className="chart-axis-boundary" x1={axisXMin} x2={axisXMax} y1={yMin} y2={yMin} />

      {ticks.map((tick, index) => {
        const isEdge = index === 0 || index === ticks.length - 1;
        return (
          <g key={tick.value} transform={`translate(${tick.position},0)`}>
            <line
              className={isEdge ? "chart-axis-edge" : "chart-axis-grid"}
              y1={yMin}
              y2={yMax + 10}
            />
            <text className="chart-axis-label" y={yMax + 25} textAnchor="middle">
              {tick.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}
