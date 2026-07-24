export const BAND_COLORS = {
  "0-399": "#808080",
  "400-799": "#804000",
  "800-1199": "#008000",
  "1200-1599": "#00C0C0",
  "1600-1999": "#0000FF",
  "2000-2399": "#C0C000",
  "2400-2799": "#FF8000",
  "2800-3199": "#FF0000",
};

export function getDiffColor(diffBand) {
  return BAND_COLORS[diffBand] || "#808080";
}
