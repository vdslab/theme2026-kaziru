const PEER_BASELINES_PATH = "/peer-baselines.json";

export async function loadPeerBaselines(signal) {
  const response = await fetch(PEER_BASELINES_PATH, { signal });

  if (!response.ok) {
    throw new Error(`比較データの読み込みに失敗しました: ${PEER_BASELINES_PATH}`);
  }

  const data = await response.json();

  if (!data?.bands || typeof data.bands !== "object") {
    throw new Error("比較データの形式が正しくありません");
  }

  return data;
}

export function getPeerRatingBand(peerBaselines, rate) {
  const numericRate = Number(rate);

  if (!peerBaselines?.bands || !Number.isFinite(numericRate) || numericRate < 0) {
    return null;
  }

  const lower = Math.floor(numericRate / 100) * 100;
  const upper = lower + 99;
  const key = `${lower}-${upper}`;
  const data = peerBaselines.bands[key];

  if (!data) {
    return null;
  }

  return { key, lower, upper, data };
}

export function createPeerProgressMap(peerRatingBand, statistic = "mean") {
  const result = new Map();
  const acStatistic = statistic === "median" ? "median" : "mean";

  for (const [algorithm, tagData] of Object.entries(peerRatingBand?.data?.tags ?? {})) {
    const problemCount = Number(tagData.problemCount);
    const peerAc = Number(tagData.ac?.[acStatistic]);

    if (!Number.isFinite(problemCount) || problemCount <= 0 || !Number.isFinite(peerAc)) {
      continue;
    }

    const ac = Math.min(problemCount, Math.max(0, peerAc));
    result.set(algorithm, {
      ac,
      remaining: problemCount - ac,
      problemCount,
    });
  }

  return result;
}
