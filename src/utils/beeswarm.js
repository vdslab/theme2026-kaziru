export const GAP = 16;

// 円の重なり判定
export function hasOverlap(y, x, r, placed) {
  for (const p of placed) {
    const minDist = r + p.r + GAP;
    const dx = Math.abs(x - p.x);

    if (dx >= minDist) {
      continue;
    }

    const dyLimit = Math.sqrt(
      minDist * minDist - dx * dx
    );

    if (Math.abs(y - p.y) < dyLimit) {
      return true;
    }
  }

  return false;
}

// 1つの点を配置
export function placeOne(x, r, placed) {
  const candidates = [0];

  for (const p of placed) {
    const minDist = r + p.r + GAP;
    const dx = Math.abs(x - p.x);

    if (dx < minDist) {
      const dy = Math.sqrt(
        minDist * minDist - dx * dx
      );

      candidates.push(p.y + dy);
      candidates.push(p.y - dy);
    }
  }

  candidates.sort(
    (a, b) => Math.abs(a) - Math.abs(b)
  );

  for (const y of candidates) {
    if (!hasOverlap(y, x, r, placed)) {
      return y;
    }
  }

  for (let k = 1; k < 5000; k++) {
    for (const y of [k * 6, -k * 6]) {
      if (!hasOverlap(y, x, r, placed)) {
        return y;
      }
    }
  }

  return 0;
}

// summaryにx座標と半径を追加
export function computeBeeswarm(summary) {
  const placed = [];

  const sorted = [...summary].sort(
    (a, b) => a.x - b.x
  );

  for (const item of sorted) {
    const y = placeOne(
      item.x,
      item.r,
      placed
    );

    placed.push({
      ...item,
      y,
    });
  }

  return placed;
}