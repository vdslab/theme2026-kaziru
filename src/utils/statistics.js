// 難易度帯の定義
export const DIFF_BANDS = [
  { min: -Infinity, max: 400, name: "Gray" },
  { min: 400, max: 800, name: "Brown" },
  { min: 800, max: 1200, name: "Green" },
  { min: 1200, max: 1600, name: "Cyan" },
  { min: 1600, max: 2000, name: "Blue" },
];

// 円の半径の最小値と最大値
export const R_MIN = 30;
export const R_MAX = 85;

// Python版と同じAtCoder Problems方式の低difficulty補正。
export function adjustDifficulty(diff) {
  if (!Number.isFinite(diff)) {
    return Number.NaN;
  }

  if (diff >= 400) {
    return diff;
  }

  return 400 / Math.exp(1 - diff / 400);
}

// difficulty帯判定
export function diffToBand(diff) {
  if (diff == null || Number.isNaN(diff)) {
    return null;
  }

  const value = Math.max(0, diff);

  for (const band of DIFF_BANDS) {
    if (value >= band.min && value < band.max) {
      return band.name;
    }
  }

  return null;
}

// グループ化
export function groupByAlgorithm(rows, algoCol) {
  const groups = {};

  for (const row of rows) {
    const algo = row[algoCol];
    const diff = row.diffCalc;

    if (!algo || Number.isNaN(diff)) {
      continue;
    }

    if (!groups[algo]) {
      groups[algo] = [];
    }

    groups[algo].push(diff);
  }

  return groups;
}

// 統計計算
export function quantile(values, q) {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const pos = (sorted.length - 1) * q;
  const lower = Math.floor(pos);
  const upper = Math.ceil(pos);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = pos - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function median(values) {
  return quantile(values, 0.5);
}

export function mean(values) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// 最終集計
export function createSummary(groups, bandCounts) {
  const summary = [];

  for (const [algo, values] of Object.entries(groups)) {
    const sorted = [...values].sort((a, b) => a - b);

    summary.push({
      algo,
      n: sorted.length,
      q1: quantile(sorted, 0.25),
      median: median(sorted),
      mean: mean(sorted),
      q3: quantile(sorted, 0.75),
      min: sorted[0],
      max: sorted[sorted.length - 1],

      ...(bandCounts[algo] ?? {
        Gray: 0,
        Brown: 0,
        Green: 0,
        Cyan: 0,
        Blue: 0,
      }),
    });
  }

  const maxN = Math.max(...summary.map((item) => item.n));

  for (const item of summary) {
    item.x = item.q1;

    item.r = Math.max(R_MIN, Math.sqrt(item.n / maxN) * R_MAX);
  }

  return summary;
}

// アルゴリズムごとにdifficulty帯の件数をカウント
export function countBandsByAlgorithm(rows, algoCol) {
  const result = {};

  for (const row of rows) {
    const algo = row[algoCol];
    const diff = row.diffCalc;

    if (!algo || Number.isNaN(diff)) {
      continue;
    }

    const band = diffToBand(diff);

    if (!band) {
      continue;
    }

    if (!result[algo]) {
      result[algo] = {
        Gray: 0,
        Brown: 0,
        Green: 0,
        Cyan: 0,
        Blue: 0,
      };
    }

    result[algo][band]++;
  }

  return result;
}
