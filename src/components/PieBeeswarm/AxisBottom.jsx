export default function AxisBottom({ xMin, xMax, yMin, yMax, tickStep }) {


  const ticks = [];
  for (let t = xMin; t <= xMax; t += tickStep) {
    ticks.push(t);
  }

  return (
    <g>
      {/* 軸線 */}
      <line x1={xMin} x2={xMax} y1={yMax} y2={yMax} stroke="black" />

      {ticks.map((tick) => (
        <g key={tick} transform={`translate(${tick},0)`}>
          {/* tick線 */}
          <line y1={yMin} y2={yMax + 10} stroke="gray" />

          {/* ラベル */}
          <text y={yMax + 25} textAnchor="middle" fontSize={12}>
            {tick}
          </text>
        </g>
      ))}
    </g>
  );
}
