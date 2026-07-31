import { useEffect, useMemo, useState, useCallback, useRef } from "react";

import { computeBeeswarm } from "./utils/beeswarm";
import { computeAnchoredClassicalMds, DEFAULT_LOWER_FRACTION } from "./utils/classicalMds";
import { computeOptimalLowerFraction } from "./utils/optimizeLowerFraction";
import { loadCsv, findColumn } from "./utils/loadCsv";
import { groupByAlgorithm, countBandsByAlgorithm, createSummary } from "./utils/statistics";
import { fetchUserRate } from "./api/loadUser";
import { fetchAllUserSubmissions } from "./api/loadUserSubmissions";
import { buildSubmissionMap } from "./utils/submissions";

import Header from "./components/Header";
import Main from "./components/Main";

export default function App() {
  const [summaryData, setSummaryData] = useState([]);
  const [algorithmGroups, setAlgorithmGroups] = useState({});
  const [allRows, setAllRows] = useState([]);
  const [lowerFraction, setLowerFraction] = useState(DEFAULT_LOWER_FRACTION);

  // ユーザー情報
  const [username, setUsername] = useState("");
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [submissionsMap, setSubmissionsMap] = useState(new Map());
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false);

  // 自動最適化（都度計算）
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isOptimized, setIsOptimized] = useState(false);
  const isOptimizingRef = useRef(false);
  const optimizationGenerationRef = useRef(0);

  // 入力やユーザー情報が変わった場合、予約済みの古い計算結果を無効化する
  const invalidateOptimization = useCallback(() => {
    optimizationGenerationRef.current += 1;
    isOptimizingRef.current = false;
    setIsOptimizing(false);
    setIsOptimized(false);
  }, []);

  // 最適化計算の共通処理
  const runOptimize = useCallback(() => {
    if (!rate || !submissionsLoaded || summaryData.length === 0 || isOptimizingRef.current) {
      return;
    }

    const generation = ++optimizationGenerationRef.current;
    isOptimizingRef.current = true;
    setIsOptimizing(true);
    // requestAnimationFrame でブラウザが「計算中...」を描画してから計算を開始する
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (generation !== optimizationGenerationRef.current) {
          return;
        }

        const { optimalFraction } = computeOptimalLowerFraction({
          summary: summaryData,
          groups: algorithmGroups,
          rate,
          submissionsMap,
          allRows,
        });

        if (generation !== optimizationGenerationRef.current) {
          return;
        }

        if (optimalFraction != null) {
          setLowerFraction(optimalFraction);
          setIsOptimized(true);
        }
        isOptimizingRef.current = false;
        setIsOptimizing(false);
      }, 0);
    });
  }, [rate, submissionsLoaded, summaryData, algorithmGroups, submissionsMap, allRows]);

  // 「自動計算」ボタン押下時に最適な lowerFraction を計算して適用
  const handleAutoOptimize = useCallback(() => {
    runOptimize();
  }, [runOptimize]);

  // スライダー手動変更時に「計算済み」状態をリセット
  const handleLowerFractionChange = useCallback((value) => {
    invalidateOptimization();
    setLowerFraction(value);
  }, [invalidateOptimization]);

  const handleUsernameChange = useCallback((value) => {
    invalidateOptimization();
    setUsername(value);
    setRate(null);
    setRateError(null);
    setSubmissionsMap(new Map());
    setSubmissionsLoaded(false);
  }, [invalidateOptimization]);

  const handleFetchRate = useCallback(async () => {
    invalidateOptimization();
    const trimmed = username.trim();
    if (!trimmed) {
      setRate(null);
      return;
    }

    setRateLoading(true);
    setRateError(null);
    setRate(null);
    try {
      const userRate = await fetchUserRate(trimmed);
      setRate(userRate);
    } catch (err) {
      setRate(null);
      setRateError(err.message);
    } finally {
      setRateLoading(false);
    }
  }, [invalidateOptimization, username]);

  const handleFetchSubmissions = useCallback(async () => {
    invalidateOptimization();
    const trimmed = username.trim();
    if (!trimmed) {
      setSubmissionsMap(new Map());
      setSubmissionsLoaded(false);
      return;
    }

    setSubmissionsMap(new Map());
    setSubmissionsLoaded(false);
    try {
      const submissions = await fetchAllUserSubmissions(trimmed);
      const map = buildSubmissionMap(submissions);
      setSubmissionsMap(map);
      setSubmissionsLoaded(true);
    } catch {
      setSubmissionsLoaded(false);
    }
  }, [invalidateOptimization, username]);

  const summary = useMemo(() => {
    if (summaryData.length === 0) {
      return [];
    }

    const mdsData = computeAnchoredClassicalMds(summaryData, algorithmGroups, lowerFraction);
    return computeBeeswarm(mdsData);
  }, [algorithmGroups, lowerFraction, summaryData]);

  // レートと提出履歴が揃ったら自動で一度最適化を計算
  // ※ isOptimized を依存配列から外し、スライダー手動操作時の再計算を防ぐ
  useEffect(() => {
    if (!rate || !submissionsLoaded || summaryData.length === 0 || isOptimized) {
      return;
    }

    runOptimize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rate, submissionsLoaded, runOptimize]);

  useEffect(() => {
    async function init() {
      try {
        const rows = await loadCsv("/all_problems.csv");

        const columns = Object.keys(rows[0]);

        const algoCol = findColumn(
          columns,
          ["tag", "algorithm", "algorithm_name", "name", "アルゴリズム", "タグ"],
          "アルゴリズム名",
        );

        const diffCol = findColumn(
          columns,
          ["difficulty", "diff", "problem_difficulty", "Difficulty"],
          "difficulty",
        );

        const problemCol = ["problem_id", "id", "problem", "problem_name", "title", "url"].find(
          (column) => columns.includes(column),
        );
        const seenProblems = new Set();

        const processedRows = rows
          .filter((row) => row[algoCol] && row[diffCol] != null && row[diffCol] !== "")
          .filter((row) => {
            if (!problemCol) {
              return true;
            }

            const key = JSON.stringify([row[algoCol], row[problemCol]]);
            if (seenProblems.has(key)) {
              return false;
            }

            seenProblems.add(key);
            return true;
          })
          .map((row) => ({
            ...row,
            // all_problems.csv の difficulty は生成時点で補正済み。
            diffCalc: Number(row[diffCol]),
          }))
          .filter((row) => row.diffCalc < 2000);

        const groups = groupByAlgorithm(processedRows, algoCol);
        const bandCounts = countBandsByAlgorithm(processedRows, algoCol);

        const summaryData = createSummary(groups, bandCounts);
        setSummaryData(summaryData);
        setAlgorithmGroups(groups);
        setAllRows(processedRows);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  return (
    <div className="app">
      <Header />
      <Main
        summary={summary}
        allRows={allRows}
        lowerFraction={lowerFraction}
        onLowerFractionChange={handleLowerFractionChange}
        username={username}
        onUsernameChange={handleUsernameChange}
        rate={rate}
        rateLoading={rateLoading}
        rateError={rateError}
        onFetchRate={handleFetchRate}
        submissionsMap={submissionsMap}
        submissionsLoaded={submissionsLoaded}
        onFetchSubmissions={handleFetchSubmissions}
        onAutoOptimize={handleAutoOptimize}
        isOptimizing={isOptimizing}
        isOptimized={isOptimized}
      />
    </div>
  );
}
