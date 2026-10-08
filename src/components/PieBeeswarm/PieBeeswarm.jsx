import { useRef, useState, useEffect } from "react";
import AxisBottom from "./AxisBottom";
import PieNode from "./PieNode";
import NodeLabel from "./NodeLabel";

export default function PieBeeswarm({
  data = [],
  rate = null,
  showLabels = false,
  showCurrentRate = false,
  progressByAlgorithm = new Map(),
  showProgress = false,
  peerProgressByAlgorithm = new Map(),
  showPeerProgress = false,
  peerStatisticLabel = "平均",
  selectedAlgorithm = null,
  onSelectAlgorithm,
}) {
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
  }, [data.length]);

  if (data.length === 0) {
    return null;
  }

  const AXIS_MIN = 0;
  const AXIS_MAX = 2000;
  const TICK_STEP = 400;
  const SIDE_MARGIN = 56;
  const RATE_LABEL_SIDE_MARGIN = 96;
  const TOP_MARGIN = 42;
  const CURRENT_RATE_LABEL_BOTTOM_MARGIN = 84;
  const PROGRESS_RING_GAP = 4;
  const PROGRESS_RING_WIDTH = 12;
  const PEER_RING_GAP = 3;
  const PEER_RING_WIDTH = 5;

  const getVisualRadius = (item) =>
    showPeerProgress && peerProgressByAlgorithm.has(item.algo)
      ? item.r + PEER_RING_GAP + PEER_RING_WIDTH
      : item.r;

  const nodeXMin = Math.min(...data.map((item) => item.x - getVisualRadius(item)));
  const nodeXMax = Math.max(...data.map((item) => item.x + getVisualRadius(item)));
  const nodeYMin = Math.min(...data.map((item) => item.y - getVisualRadius(item)));
  const nodeYMax = Math.max(...data.map((item) => item.y + getVisualRadius(item)));

  const currentRate = rate == null ? null : Number(rate);
  const shouldShowCurrentRate = showCurrentRate && Number.isFinite(currentRate);
  const currentRateX = Math.min(AXIS_MAX, Math.max(AXIS_MIN, currentRate));
  const currentRateLabel = currentRate > AXIS_MAX ? `${AXIS_MAX}+` : String(currentRate);

  const contentXMin = Math.min(AXIS_MIN, nodeXMin) - SIDE_MARGIN;
  const contentXMax =
    Math.max(AXIS_MAX, nodeXMax, shouldShowCurrentRate ? currentRateX : AXIS_MAX) +
    RATE_LABEL_SIDE_MARGIN;
  const contentYMin = nodeYMin - TOP_MARGIN;
  const bottomMargin = CURRENT_RATE_LABEL_BOTTOM_MARGIN;
  const contentYMax = nodeYMax + bottomMargin;

  let viewBoxX = contentXMin;
  let viewBoxY = contentYMin;
  let viewBoxWidth = contentXMax - contentXMin;
  let viewBoxHeight = contentYMax - contentYMin;

  if (containerSize.width > 0 && containerSize.height > 0) {
    const aspectRatio = containerSize.width / containerSize.height;
    const contentAspectRatio = viewBoxWidth / viewBoxHeight;

    if (contentAspectRatio > aspectRatio) {
      const fittedHeight = viewBoxWidth / aspectRatio;
      viewBoxY -= (fittedHeight - viewBoxHeight) / 2;
      viewBoxHeight = fittedHeight;
    } else {
      const fittedWidth = viewBoxHeight * aspectRatio;
      viewBoxWidth = fittedWidth;
    }
  }

  const axisY = viewBoxY + viewBoxHeight - bottomMargin;
  const viewBoxXMax = viewBoxX + viewBoxWidth;
  const maxNodeRadius = Math.max(...data.map(getVisualRadius));
  const plotXMin = viewBoxX + Math.max(SIDE_MARGIN, maxNodeRadius);
  const plotXMax = viewBoxXMax - Math.max(RATE_LABEL_SIDE_MARGIN, maxNodeRadius);
  const plotXWidth = Math.max(1, plotXMax - plotXMin);
  const xScale = (value) =>
    plotXMin + (Math.min(AXIS_MAX, Math.max(AXIS_MIN, value)) / AXIS_MAX) * plotXWidth;
  const ticks = [];
  for (let value = AXIS_MIN; value <= AXIS_MAX; value += TICK_STEP) {
    ticks.push({ value, position: xScale(value) });
  }
  const renderedData = data.map((item) => {
    const peerProgress = peerProgressByAlgorithm.get(item.algo);

    return {
      ...item,
      x: xScale(item.x),
      visualRadius: getVisualRadius(item),
      progressSlices: [
        { label: "AC", value: progressByAlgorithm.get(item.algo)?.ac ?? 0 },
        { label: "Unsolved", value: progressByAlgorithm.get(item.algo)?.unsolved ?? 0 },
        { label: "Untried", value: progressByAlgorithm.get(item.algo)?.untried ?? 0 },
      ],
      peerProgressSlices: [
        { label: "PeerAC", value: peerProgress?.ac ?? 0 },
        { label: "PeerRemaining", value: peerProgress?.remaining ?? 0 },
      ],
    };
  });

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={viewBoxX}
          y={viewBoxY}
          width={viewBoxWidth}
          height={viewBoxHeight}
          fill="transparent"
          onClick={() => onSelectAlgorithm?.(null)}
        />
        <AxisBottom
          yMin={viewBoxY + TOP_MARGIN}
          yMax={axisY}
          ticks={ticks}
          axisXMin={xScale(0)}
          axisXMax={xScale(AXIS_MAX)}
        />

        {shouldShowCurrentRate && (
          <g className="current-rate-line" transform={`translate(${xScale(currentRateX)},0)`}>
            <line y1={viewBoxY + TOP_MARGIN} y2={axisY} />
            <text y={axisY + 64} textAnchor="middle">
              {currentRateLabel}
            </text>
          </g>
        )}

        {renderedData.map((item) => (
          <PieNode
            key={item.algo}
            label={item.algo}
            x={item.x}
            y={item.y}
            r={item.r}
            progressSlices={item.progressSlices}
            showProgress={showProgress}
            progressRingGap={PROGRESS_RING_GAP}
            progressRingWidth={PROGRESS_RING_WIDTH}
            peerProgressSlices={item.peerProgressSlices}
            showPeerProgress={showPeerProgress && peerProgressByAlgorithm.has(item.algo)}
            peerStatisticLabel={peerStatisticLabel}
            peerRingGap={PEER_RING_GAP}
            peerRingWidth={PEER_RING_WIDTH}
            selected={item.algo === selectedAlgorithm}
            dimmed={selectedAlgorithm !== null && item.algo !== selectedAlgorithm}
            onSelect={() => onSelectAlgorithm?.(item.algo)}
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
          renderedData.map((item) => (
            <NodeLabel
              key={item.algo}
              x={item.x}
              y={item.y}
              r={item.visualRadius}
              text={item.algo}
            />
          ))}
      </svg>
    </div>
  );
}
