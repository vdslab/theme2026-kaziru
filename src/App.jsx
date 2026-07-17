import { useEffect, useMemo, useState } from "react";

import { computeBeeswarm } from "./utils/beeswarm";
import {
  computeAnchoredClassicalMds,
  DEFAULT_LOWER_FRACTION,
} from "./utils/classicalMds";
import { loadCsv, findColumn } from "./utils/loadCsv";
import {
  groupByAlgorithm,
  countBandsByAlgorithm,
  createSummary,
} from "./utils/statistics";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

export default function App() {
  const [summaryData, setSummaryData] = useState([]);
  const [algorithmGroups, setAlgorithmGroups] = useState({});
  const [allRows, setAllRows] = useState([]);
  const [lowerFraction, setLowerFraction] = useState(DEFAULT_LOWER_FRACTION);

  const summary = useMemo(() => {
    if (summaryData.length === 0) {
      return [];
    }

    const mdsData = computeAnchoredClassicalMds(
      summaryData,
      algorithmGroups,
      lowerFraction,
    );
    return computeBeeswarm(mdsData);
  }, [algorithmGroups, lowerFraction, summaryData]);

  useEffect(() => {
    async function init() {
      try {
        const rows = await loadCsv("/all_problems.csv");

        const columns = Object.keys(rows[0]);

        const algoCol = findColumn(
          columns,
          [
            "tag",
            "algorithm",
            "algorithm_name",
            "name",
            "アルゴリズム",
            "タグ",
          ],
          "アルゴリズム名",
        );

        const diffCol = findColumn(
          columns,
          ["difficulty", "diff", "problem_difficulty", "Difficulty"],
          "difficulty",
        );

        const problemCol = [
          "problem_id",
          "id",
          "problem",
          "problem_name",
          "title",
          "url",
        ].find((column) => columns.includes(column));
        const seenProblems = new Set();

        const processedRows = rows
          .filter(
            (row) =>
              row[algoCol] && row[diffCol] != null && row[diffCol] !== "",
          )
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
      />
      <Footer />
    </div>
  );
}
