import { useEffect, useState } from "react";
import { loadCsv, findColumn } from "./utils/loadCsv";
import {
  groupByAlgorithm,
  countBandsByAlgorithm,
  createSummary,
} from "./utils/statistics";
import { computeBeeswarm } from "./utils/beeswarm";

import Header from "./components/Header";
import Main from "./components/Main";
import Footer from "./components/Footer";

export default function App() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    async function init() {
      try {
        const rows = await loadCsv("/03_tag_diff_list.csv");

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

        const filteredRows = rows
          .map((row) => ({
            ...row,
            [diffCol]: Math.max(0, Number(row[diffCol])),
          }))
          .filter((row) => row[diffCol] < 2000);

        const groups = groupByAlgorithm(filteredRows, algoCol, diffCol);

        const bandCounts = countBandsByAlgorithm(
          filteredRows,
          algoCol,
          diffCol,
        );

        const summaryData = createSummary(groups, bandCounts);

        const plottedData = computeBeeswarm(summaryData);

        console.log(plottedData);

        setSummary(plottedData);
      } catch (error) {
        console.error(error);
      }
    }

    init();
  }, []);

  return (
    <div>
      <Header />
      <Main />
      <Footer />
    </div>
  );
}
