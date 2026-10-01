import { useRef, useCallback, useEffect } from "react";

export default function Splitter({
  value = 330,
  onChange,
  min = 200,
  max = 800,
  ariaLabel = "サイズを調整",
}) {
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const clamp = useCallback((v) => Math.min(max, Math.max(min, Math.round(v))), [min, max]);

  const emitChange = useCallback(
    (newValue) => {
      const clamped = clamp(newValue);
      if (clamped !== valueRef.current) {
        onChangeRef.current(clamped);
      }
    },
    [clamp],
  );

  const startDrag = useCallback(
    (startClientX) => {
      document.body.classList.add("splitter-dragging");

      const onMouseMove = (e) => {
        emitChange(value + (e.clientX - startClientX));
      };

      const onTouchMove = (e) => {
        emitChange(value + (e.touches[0].clientX - startClientX));
      };

      const onEnd = () => {
        document.body.classList.remove("splitter-dragging");
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onEnd);
        document.removeEventListener("touchmove", onTouchMove);
        document.removeEventListener("touchend", onEnd);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onEnd);
      document.addEventListener("touchmove", onTouchMove, { passive: false });
      document.addEventListener("touchend", onEnd);
    },
    [value, emitChange],
  );

  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      startDrag(e.clientX);
    },
    [startDrag],
  );

  const handleTouchStart = useCallback(
    (e) => {
      startDrag(e.touches[0].clientX);
    },
    [startDrag],
  );

  const handleKeyDown = useCallback(
    (e) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        emitChange(value - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        emitChange(value + step);
      } else if (e.key === "Home") {
        e.preventDefault();
        emitChange(min);
      } else if (e.key === "End") {
        e.preventDefault();
        emitChange(max);
      }
    },
    [value, emitChange, min, max],
  );

  return (
    <div
      className="splitter"
      role="separator"
      aria-orientation="vertical"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onKeyDown={handleKeyDown}
    />
  );
}
