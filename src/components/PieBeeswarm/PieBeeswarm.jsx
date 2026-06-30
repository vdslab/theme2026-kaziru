import { useRef, useState, useEffect } from "react";
import AxisBottom from "./AxisBottom";
import PieNode from "./PieNode";
import NodeLabel from "./NodeLabel";

export default function PieBeeswarm({ data = [], showLabels = false }) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return null;
  }

  const AXIS_MIN = 0;
  const AXIS_MAX = 2000;
  const TICK_STEP = 400;

  const yMin = Math.min(...data.map((d) => d.y - d.r));
  const yMax = Math.max(...data.map((d) => d.y + d.r));
  const padding = TICK_STEP;

  const viewBoxWidth = AXIS_MAX + padding * 2;
  const dataHeight = yMax - yMin;
  const dataCenterY = (yMin + yMax) / 2;

  // コンテナのアスペクト比に合わせて viewBox の高さを計算
  let viewBoxHeight;
  if (containerSize.width > 0 && containerSize.height > 0) {
    const aspectRatio = containerSize.width / containerSize.height;
    viewBoxHeight = Math.max(viewBoxWidth / aspectRatio, dataHeight + padding * 2);
  } else {
    viewBoxHeight = dataHeight + padding * 2;
  }

  const viewBoxY = dataCenterY - viewBoxHeight / 2;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${AXIS_MIN - padding} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
      >
        <AxisBottom
          xMin={AXIS_MIN}
          xMax={AXIS_MAX}
          yMax={yMax}
          tickStep={TICK_STEP}
        />

        {data.map((item) => (
          <PieNode
            key={item.algo}
            x={item.x}
            y={item.y}
            r={item.r}
            slices={[
              { label: "Gray", value: item.Gray },
              { label: "Brown", value: item.Brown },
              { label: "Green", value: item.Green },
              { label: "Cyan", value: item.Cyan },
              { label: "Blue", value: item.Blue },
            ]}
          />
        ))}

        {showLabels &&
          data.map((item) => (
            <NodeLabel
              key={item.algo}
              x={item.x}
              y={item.y}
              r={item.r}
              text={item.algo}
            />
          ))}
      </svg>
    </div>
  );
}
