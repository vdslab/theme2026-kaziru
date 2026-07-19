import { useLayoutEffect, useRef, useState } from "react";

export default function NodeLabel({ x, y, text, r }) {
  const LABEL_MARGIN = 10;
  const PADDING_X = 4;
  const PADDING_Y = 2;

  const textRef = useRef(null);
  const [bbox, setBBox] = useState(null);

  useLayoutEffect(() => {
    if (textRef.current) {
      setBBox(textRef.current.getBBox());
    }
  }, [text]);

  const labelY = y + r + LABEL_MARGIN;

  return (
    <g transform={`translate(${x}, ${labelY})`}>
      {bbox && (
        <rect
          x={bbox.x - PADDING_X}
          y={bbox.y - PADDING_Y}
          width={bbox.width + PADDING_X * 2}
          height={bbox.height + PADDING_Y * 2}
          fill="white"
          fillOpacity="0.85"
          rx="3"
        />
      )}

      <text
        ref={textRef}
        x="0"
        y="0"
        textAnchor="middle"
        fontSize="12"
      >
        {text}
      </text>
    </g>
  );
}
