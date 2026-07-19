export const DEFAULT_LOWER_FRACTION = 0.25;
const ANCHOR_MIN = 0;
const ANCHOR_MAX = 2000;
const ANCHOR_STEP = 200;
const TRIM_ALPHA = 0;
const QUANTILE_GRID_SIZE = 1001;

const EIGEN_TOLERANCE = 1e-11;
const EIGEN_MAX_ITERATIONS = 4000;

function quantileSorted(sorted, q) {
  if (sorted.length === 1) {
    return sorted[0];
  }

  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const weight = position - lower;

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Python版と同様に、各タグの難易度が低い側だけを距離計算に使う。
function lowerFractionValues(values, fraction = DEFAULT_LOWER_FRACTION) {
  const sorted = values
    .filter(Number.isFinite)
    .slice()
    .sort((a, b) => a - b);

  if (sorted.length === 0) {
    return [];
  }

  const count = Math.max(1, Math.ceil(sorted.length * fraction));
  return sorted.slice(0, count);
}

// 1次元のWasserstein-1距離。分位点関数の差を数値積分する。
function wassersteinDistance1d(valuesA, valuesB) {
  if (valuesA.length === 0 || valuesB.length === 0) {
    return Number.NaN;
  }

  if (TRIM_ALPHA < 0 || TRIM_ALPHA >= 0.5) {
    throw new Error("TRIM_ALPHA must satisfy 0 <= alpha < 0.5");
  }

  let total = 0;
  const last = QUANTILE_GRID_SIZE - 1;
  const quantileRange = 1 - 2 * TRIM_ALPHA;

  for (let i = 0; i <= last; i++) {
    const q = TRIM_ALPHA + (quantileRange * i) / last;
    const difference = Math.abs(
      quantileSorted(valuesA, q) - quantileSorted(valuesB, q),
    );

    // np.trapezoid と同じく、積分区間の両端だけ重みを半分にする。
    total += i === 0 || i === last ? difference / 2 : difference;
  }

  const area = total * (quantileRange / last);
  return area / quantileRange;
}

function createDistanceMatrix(distributions) {
  const size = distributions.length;
  const distances = Array.from({ length: size }, () => Array(size).fill(0));

  for (let i = 0; i < size; i++) {
    for (let j = i + 1; j < size; j++) {
      const distance = wassersteinDistance1d(
        distributions[i],
        distributions[j],
      );

      distances[i][j] = distance;
      distances[j][i] = distance;
    }
  }

  return distances;
}

// B = -1/2 J D^2 J を、行列積を作らずに二重中心化する。
function doubleCenterSquaredDistances(distances) {
  const size = distances.length;
  const rowMeans = Array(size).fill(0);
  let grandTotal = 0;

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const squared = distances[i][j] ** 2;
      rowMeans[i] += squared;
      grandTotal += squared;
    }

    rowMeans[i] /= size;
  }

  const grandMean = grandTotal / (size * size);

  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) =>
      -0.5 *
      (distances[i][j] ** 2 - rowMeans[i] - rowMeans[j] + grandMean),
    ),
  );
}

function multiplyMatrixVector(matrix, vector, diagonalShift = 0) {
  return matrix.map((row, i) => {
    let value = diagonalShift * vector[i];

    for (let j = 0; j < row.length; j++) {
      value += row[j] * vector[j];
    }

    return value;
  });
}

function normalize(vector) {
  const norm = Math.hypot(...vector);
  return norm > 0 ? vector.map((value) => value / norm) : vector;
}

// 対称行列の最大固有値・固有ベクトルだけを求める。
// Gershgorin下界ぶん対角シフトし、最大絶対値ではなく最大固有値へ収束させる。
function leadingEigenpair(matrix) {
  const size = matrix.length;
  let lowerBound = Infinity;

  for (let i = 0; i < size; i++) {
    let offDiagonalRadius = 0;

    for (let j = 0; j < size; j++) {
      if (i !== j) {
        offDiagonalRadius += Math.abs(matrix[i][j]);
      }
    }

    lowerBound = Math.min(lowerBound, matrix[i][i] - offDiagonalRadius);
  }

  const diagonalShift = Math.max(0, -lowerBound) + 1;
  let vector = Array.from(
    { length: size },
    (_, i) => Math.sin((i + 1) * 1.7) + Math.cos((i + 1) * 0.37),
  );
  vector = normalize(vector);

  for (let iteration = 0; iteration < EIGEN_MAX_ITERATIONS; iteration++) {
    const next = normalize(
      multiplyMatrixVector(matrix, vector, diagonalShift),
    );

    let sameDirectionError = 0;
    let oppositeDirectionError = 0;

    for (let i = 0; i < size; i++) {
      sameDirectionError += (next[i] - vector[i]) ** 2;
      oppositeDirectionError += (next[i] + vector[i]) ** 2;
    }

    vector = next;

    if (
      Math.sqrt(Math.min(sameDirectionError, oppositeDirectionError)) <
      EIGEN_TOLERANCE
    ) {
      break;
    }
  }

  const multiplied = multiplyMatrixVector(matrix, vector);
  const eigenvalue = vector.reduce(
    (sum, value, i) => sum + value * multiplied[i],
    0,
  );

  return { eigenvalue, eigenvector: vector };
}

function classicalMds1d(distances) {
  const gramMatrix = doubleCenterSquaredDistances(distances);
  const { eigenvalue, eigenvector } = leadingEigenpair(gramMatrix);

  if (!Number.isFinite(eigenvalue) || eigenvalue <= 0) {
    return null;
  }

  const scale = Math.sqrt(eigenvalue);
  return eigenvector.map((value) => value * scale);
}

function alignByAnchors(coordinates, realCount, anchorValues) {
  const anchorCoordinates = coordinates.slice(realCount);
  const meanCoordinate =
    anchorCoordinates.reduce((sum, value) => sum + value, 0) /
    anchorCoordinates.length;
  const meanTarget =
    anchorValues.reduce((sum, value) => sum + value, 0) /
    anchorValues.length;

  let covariance = 0;
  let variance = 0;

  for (let i = 0; i < anchorValues.length; i++) {
    const centeredCoordinate = anchorCoordinates[i] - meanCoordinate;
    covariance += centeredCoordinate * (anchorValues[i] - meanTarget);
    variance += centeredCoordinate ** 2;
  }

  if (variance < 1e-12) {
    return null;
  }

  const slope = covariance / variance;
  const intercept = meanTarget - slope * meanCoordinate;

  return coordinates.map((value) => slope * value + intercept);
}

function createAnchorValues() {
  const anchors = [];

  for (let value = ANCHOR_MIN; value <= ANCHOR_MAX; value += ANCHOR_STEP) {
    anchors.push(value);
  }

  return anchors;
}

/**
 * 各アルゴリズムの難易度分布を1次元古典的MDSへ埋め込み、x座標を返す。
 * 円の個数・半径・色内訳は変更しない。
 */
export function computeAnchoredClassicalMds(
  summary,
  groups,
  lowerFraction = DEFAULT_LOWER_FRACTION,
) {
  if (summary.length === 0) {
    return [];
  }

  const realDistributions = summary.map((item) =>
    lowerFractionValues(groups[item.algo] ?? [], lowerFraction),
  );
  const anchorValues = createAnchorValues();
  const anchorDistributions = anchorValues.map((value) => [value]);
  const distances = createDistanceMatrix([
    ...realDistributions,
    ...anchorDistributions,
  ]);
  const rawCoordinates = classicalMds1d(distances);

  if (!rawCoordinates) {
    console.warn("Classical MDS failed; falling back to the existing x positions.");
    return summary;
  }

  const alignedCoordinates = alignByAnchors(
    rawCoordinates,
    summary.length,
    anchorValues,
  );

  if (!alignedCoordinates) {
    console.warn("MDS anchor alignment failed; falling back to the existing x positions.");
    return summary;
  }

  return summary.map((item, index) => ({
    ...item,
    rawMdsX: rawCoordinates[index],
    mdsX: alignedCoordinates[index],
    x: alignedCoordinates[index],
  }));
}
