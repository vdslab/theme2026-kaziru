import { computeAnchoredClassicalMds } from "./classicalMds";
import { computeBeeswarm } from "./beeswarm";

/**
 * 各アルゴリズムのAC率（AC数 / 総問題数）を事前計算する。
 */
function computeAcRateByAlgo(allRows, submissionsMap) {
  const acCountByAlgo = new Map();
  const totalCountByAlgo = new Map();

  for (const row of allRows) {
    const algo = row.tag;
    totalCountByAlgo.set(algo, (totalCountByAlgo.get(algo) ?? 0) + 1);
    if (submissionsMap.get(row.problem_id) === true) {
      acCountByAlgo.set(algo, (acCountByAlgo.get(algo) ?? 0) + 1);
    }
  }

  const acRateByAlgo = new Map();
  for (const [algo, total] of totalCountByAlgo) {
    const ac = acCountByAlgo.get(algo) ?? 0;
    acRateByAlgo.set(algo, ac / total);
  }

  return acRateByAlgo;
}

/**
 * 与えられた fraction で MDS + beeswarm を計算し、スコアを返す。
 */
function evaluateFraction(fraction, summary, groups, rate, acRateByAlgo) {
  const mdsData = computeAnchoredClassicalMds(summary, groups, fraction);
  const placedData = computeBeeswarm(mdsData);

  const leftAcRates = [];
  const rightAcRates = [];

  for (const item of placedData) {
    const acRate = acRateByAlgo.get(item.algo);
    if (acRate == null) continue;

    if (item.x < rate) {
      leftAcRates.push(acRate);
    } else {
      rightAcRates.push(acRate);
    }
  }

  const leftAvg =
    leftAcRates.length > 0
      ? leftAcRates.reduce((sum, v) => sum + v, 0) / leftAcRates.length
      : 0;
  const rightAvg =
    rightAcRates.length > 0
      ? rightAcRates.reduce((sum, v) => sum + v, 0) / rightAcRates.length
      : 0;

  return leftAvg - rightAvg;
}

export function computeOptimalLowerFraction({
  summary,
  groups,
  rate,
  submissionsMap,
  allRows,
}) {
  if (!rate || submissionsMap.size === 0 || summary.length === 0) {
    return { optimalFraction: null, scores: [] };
  }

  // AC率を事前計算（探索の外で1回だけ）
  const acRateByAlgo = computeAcRateByAlgo(allRows, submissionsMap);

  // ---- Stage 1: 粗い探索 (step = 0.1) ----
  const coarseStep = 0.1;
  const coarseScores = [];
  let bestCoarseFraction = null;
  let bestCoarseScore = -Infinity;

  for (let f = 0; f <= 1; f += coarseStep) {
    const fraction = Math.round(f * 100) / 100;
    const score = evaluateFraction(fraction, summary, groups, rate, acRateByAlgo);
    coarseScores.push({ fraction, score });

    if (score >= bestCoarseScore) {
      bestCoarseScore = score;
      bestCoarseFraction = fraction;
    }
  }

  // ---- Stage 2: 細かい探索 (step = 0.01) ----
  // 最良点の前後 coarseStep の範囲を細かく調べる
  const fineStep = 0.01;
  const fineStart = Math.max(0, bestCoarseFraction - coarseStep);
  const fineEnd = Math.min(1, bestCoarseFraction + coarseStep);
  const fineScores = [];

  let bestScore = -Infinity;
  let optimalFraction = null;

  for (let f = fineStart; f <= fineEnd + fineStep / 2; f += fineStep) {
    const fraction = Math.round(f * 100) / 100;
    const score = evaluateFraction(fraction, summary, groups, rate, acRateByAlgo);
    fineScores.push({ fraction, score });

    if (score >= bestScore) {
      bestScore = score;
      optimalFraction = fraction;
    }
  }

  return { optimalFraction, scores: [...coarseScores, ...fineScores] };
}
