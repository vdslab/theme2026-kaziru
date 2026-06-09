export default function PieBeeswarm({ data = [] }) {
  if (data.length === 0) {
    return null;
  }

  const xMin = Math.min(...data.map((d) => d.x - d.r));
  const xMax = Math.max(...data.map((d) => d.x + d.r));

  const yMin = Math.min(...data.map((d) => d.y - d.r));
  const yMax = Math.max(...data.map((d) => d.y + d.r));

  return (
    <svg
      width="100%"
      height="800"
      viewBox={`${xMin} ${yMin} ${xMax - xMin} ${yMax - yMin}`}
    >
      {data.map((item) => (
        <circle
          key={item.algo}
          cx={item.x}
          cy={item.y}
          r={item.r}
          fill="steelblue"
          stroke="black"
        />
      ))}
    </svg>
  );
}
