import { useEffect, useRef, useState } from "react";

export default function NodeLabel({ x, y, text, r }) {
  const LABEL_MARGIN = 10;
  const PADDING_X = 4;
  const PADDING_Y = 2;

  const textRef = useRef(null);
  const [bbox, setBBox] = useState(null);

  useEffect(() => {
    if (textRef.current) {
      setBBox(textRef.current.getBBox());
    }
  }, [text]);

  const textY = y + r + LABEL_MARGIN;

  return (
    <g>
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
        x={x}
        y={textY}
        textAnchor="middle"
        fontSize="12"
      >
        {text}
      </text>
    </g>
  );
}