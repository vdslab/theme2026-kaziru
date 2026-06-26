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
import { fetchUserRate } from "./api/loadUser";

export default function App() {
  const [summary, setSummary] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [username, setUsername] = useState("");
  const [rate, setRate] = useState(null);

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

        const processedRows = rows
          .filter(
            (row) =>
              row[algoCol] && row[diffCol] != null && row[diffCol] !== "",
          )
          .map((row) => ({
            ...row,
            diffCalc: Math.max(0, Number(row[diffCol])),
          }))
          .filter((row) => row.diffCalc < 2000);

        const groups = groupByAlgorithm(processedRows, algoCol);

        const bandCounts = countBandsByAlgorithm(processedRows, algoCol);

        const summaryData = createSummary(groups, bandCounts);

        const plottedData = computeBeeswarm(summaryData);

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
      <div className="username-bar">
        <input
          className="username-input"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter") {
              const userRate = await fetchUserRate(username);
              setRate(userRate);
            }
          }}
        />
      </div>
      <Main summary={summary} allRows={allRows} rate={rate} />
      <Footer />
    </div>
  );
}
