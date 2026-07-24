export const GAP = 16;
const NEIGHBOR_COUNT = 3;

function getNearestPlacedNodes(algo, placed, distanceByAlgorithm) {
  const distances = distanceByAlgorithm.get(algo);
  if (!distances) {
    return [];
  }

  return placed
    .map((node) => ({ node, distance: distances.get(node.algo) }))
    .filter(({ distance }) => Number.isFinite(distance))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, NEIGHBOR_COUNT);
}

function calculatePreferredY(algo, placed, distanceByAlgorithm) {
  const neighbors = getNearestPlacedNodes(algo, placed, distanceByAlgorithm);
  if (neighbors.length === 0) {
    return 0;
  }

  const weighted = neighbors.reduce(
    (result, { node, distance }) => {
      const weight = 1 / (distance + 1);
      return {
        total: result.total + node.y * weight,
        weight: result.weight + weight,
      };
    },
    { total: 0, weight: 0 },
  );

  return weighted.total / weighted.weight;
}

// 円の重なり判定
export function hasOverlap(y, x, r, placed) {
  for (const p of placed) {
    const minDist = r + p.r + GAP;
    const dx = Math.abs(x - p.x);

    if (dx >= minDist) {
      continue;
    }

    const dyLimit = Math.sqrt(minDist * minDist - dx * dx);

    if (Math.abs(y - p.y) < dyLimit) {
      return true;
    }
  }

  return false;
}

// 1つの点を配置
export function placeOne(x, r, placed, algo, distanceByAlgorithm = new Map()) {
  const preferredY = calculatePreferredY(algo, placed, distanceByAlgorithm);
  const candidates = [0, preferredY];

  for (const p of placed) {
    const minDist = r + p.r + GAP;
    const dx = Math.abs(x - p.x);

    if (dx < minDist) {
      const dy = Math.sqrt(minDist * minDist - dx * dx);

      candidates.push(p.y + dy);
      candidates.push(p.y - dy);
    }
  }

  candidates.sort(
    (a, b) =>
      Math.abs(a - preferredY) + Math.abs(a) * 0.1 -
      (Math.abs(b - preferredY) + Math.abs(b) * 0.1),
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
export function computeBeeswarm(summary, distanceByAlgorithm = new Map()) {
  const placed = [];

  // 大きいノードを先に中央へ配置し、小さいノードを上下へ逃がす。
  // x座標そのものは変更しないため、難易度分布の横方向の意味は保たれる。
  const sorted = [...summary].sort((a, b) => b.r - a.r || a.x - b.x);

  for (const item of sorted) {
    const y = placeOne(item.x, item.r, placed, item.algo, distanceByAlgorithm);

    placed.push({
      ...item,
      y,
    });
  }

  return placed;
}
