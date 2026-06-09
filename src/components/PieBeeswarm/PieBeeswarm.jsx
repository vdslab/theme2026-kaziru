import AxisBottom from "./AxisBottom";

export default function PieBeeswarm({ data = [] }) {
  if (data.length === 0) {
    return null;
  }

  const AXIS_MIN = 0;
  const AXIS_MAX = 2000;
  const TICK_STEP = 400;

  const yMin = Math.min(...data.map((d) => d.y - d.r));
  const yMax = Math.max(...data.map((d) => d.y + d.r));
  const padding = TICK_STEP;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${AXIS_MIN - padding} ${yMin} ${AXIS_MAX + padding * 2} ${yMax - yMin}`}
    >
      <AxisBottom xMin={AXIS_MIN} xMax={AXIS_MAX} yMax={yMax} tickStep={TICK_STEP} />

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
