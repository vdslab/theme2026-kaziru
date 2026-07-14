import { useEffect, useState } from "react";

import { computeBeeswarm } from "./utils/beeswarm";
import { computeAnchoredClassicalMds } from "./utils/classicalMds";
import { loadCsv, findColumn } from "./utils/loadCsv";
import {
  adjustDifficulty,
  groupByAlgorithm,
  countBandsByAlgorithm,
  createSummary,
} from "./utils/statistics";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

export default function App() {
  const [summary, setSummary] = useState([]);
  const [allRows, setAllRows] = useState([]);

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
            diffCalc: adjustDifficulty(Number(row[diffCol])),
          }))
          .filter((row) => row.diffCalc < 2000);

        const groups = groupByAlgorithm(processedRows, algoCol);
        const bandCounts = countBandsByAlgorithm(processedRows, algoCol);

        const summaryData = createSummary(groups, bandCounts);
        const mdsData = computeAnchoredClassicalMds(summaryData, groups);
        const plottedData = computeBeeswarm(mdsData);

        setSummary(plottedData);
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
      />
      <Footer />
    </div>
  );
}
