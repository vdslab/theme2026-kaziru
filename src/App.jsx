import { useEffect, useMemo, useState, useCallback } from "react";

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
import Footer from "./components/Footer";

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

  // 自動最適化
  const [isAutoOptimize, setIsAutoOptimize] = useState(true);

  // 自動最適化のON/OFFを切り替える
  const handleAutoOptimizeChange = useCallback((enabled) => {
    setIsAutoOptimize(enabled);
  }, []);

  const handleUsernameChange = useCallback((value) => {
    setUsername(value);
    setRate(null);
    setRateError(null);
    setSubmissionsMap(new Map());
    setSubmissionsLoaded(false);
  }, []);

  const handleFetchRate = useCallback(async () => {
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
  }, [username]);

  const handleFetchSubmissions = useCallback(async () => {
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
  }, [username]);

  // レートと提出履歴が揃ったら最適 lowerFraction を計算
  const optimalLowerFraction = useMemo(() => {
    if (!isAutoOptimize || !rate || !submissionsLoaded || summaryData.length === 0) {
      return null;
    }

    const { optimalFraction } = computeOptimalLowerFraction({
      summary: summaryData,
      groups: algorithmGroups,
      rate,
      submissionsMap,
      allRows,
      step: 0.01,
    });

    return optimalFraction;
  }, [isAutoOptimize, rate, submissionsLoaded, summaryData, algorithmGroups, submissionsMap, allRows]);

  // 最適値が計算されたら lowerFraction に反映
  useEffect(() => {
    if (isAutoOptimize && optimalLowerFraction != null) {
      setLowerFraction(optimalLowerFraction);
    }
  }, [isAutoOptimize, optimalLowerFraction]);

  const summary = useMemo(() => {
    if (summaryData.length === 0) {
      return [];
    }

    const mdsData = computeAnchoredClassicalMds(summaryData, algorithmGroups, lowerFraction);
    return computeBeeswarm(mdsData);
  }, [algorithmGroups, lowerFraction, summaryData]);

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
        onLowerFractionChange={setLowerFraction}
        username={username}
        onUsernameChange={handleUsernameChange}
        rate={rate}
        rateLoading={rateLoading}
        rateError={rateError}
        onFetchRate={handleFetchRate}
        submissionsMap={submissionsMap}
        submissionsLoaded={submissionsLoaded}
        onFetchSubmissions={handleFetchSubmissions}
        isAutoOptimize={isAutoOptimize}
        onAutoOptimizeChange={handleAutoOptimizeChange}
      />
      <Footer />
    </div>
  );
}
