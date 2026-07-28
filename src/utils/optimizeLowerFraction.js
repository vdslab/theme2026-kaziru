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

export function computeOptimalLowerFraction({
  summary,
  groups,
  rate,
  submissionsMap,
  allRows,
  step = 0.01,
}) {
  if (!rate || submissionsMap.size === 0 || summary.length === 0) {
    return { optimalFraction: null, scores: [] };
  }

  // AC率を事前計算（ループの外で1回だけ）
  const acRateByAlgo = computeAcRateByAlgo(allRows, submissionsMap);

  const scores = [];
  let bestScore = -Infinity;
  let optimalFraction = null;

  for (let f = 0; f <= 1; f += step) {
    const fraction = Math.round(f * 100) / 100;

    // この fraction で MDS + beeswarm を計算
    const mdsData = computeAnchoredClassicalMds(summary, groups, fraction);
    const placedData = computeBeeswarm(mdsData);

    // レート未満／以上のアルゴリズムに分割
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

    // スコア計算
    const leftAvg =
      leftAcRates.length > 0
        ? leftAcRates.reduce((sum, v) => sum + v, 0) / leftAcRates.length
        : 0;
    const rightAvg =
      rightAcRates.length > 0
        ? rightAcRates.reduce((sum, v) => sum + v, 0) / rightAcRates.length
        : 0;

    const score = leftAvg - rightAvg;
    scores.push({ fraction, score });

    if (score > bestScore) {
      bestScore = score;
      optimalFraction = fraction;
    }
  }

  return { optimalFraction, scores };
}
