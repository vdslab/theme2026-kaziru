import Papa from "papaparse";

export async function loadCsv(path) {
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`CSVの読み込みに失敗しました: ${path}`);
  }

  const csvText = await response.text();

  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (result.errors.length > 0) {
    console.warn("CSV Parse Warnings:", result.errors);
  }

  return result.data;
}

export function findColumn(columns, candidates, label) {
  for (const candidate of candidates) {
    if (columns.includes(candidate)) {
      return candidate;
    }
  }

  console.error(`${label} の列が見つかりません`);
  console.error("現在の列名:", columns);

  throw new Error(`${label} column not found`);
}