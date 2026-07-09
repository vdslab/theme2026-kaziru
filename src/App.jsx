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
import { fetchAllUserSubmissions } from "./api/loadUserSubmissions";
import { buildSubmissionMap } from "./utils/submissions";

export default function App() {
  const [summary, setSummary] = useState([]);
  const [allRows, setAllRows] = useState([]);
  const [username, setUsername] = useState("");
  const [rate, setRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(null);
  const [submissionsMap, setSubmissionsMap] = useState(new Map());
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissionsError, setSubmissionsError] = useState(null);

  const handleFetchRate = async () => {
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
  };

  const handleFetchSubmissions = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      setSubmissionsMap(new Map());
      return;
    }

    setSubmissionsLoading(true);
    setSubmissionsError(null);
    setSubmissionsMap(new Map());
    try {
      const submissions = await fetchAllUserSubmissions(trimmed);
      const map = buildSubmissionMap(submissions);
      setSubmissionsMap(map);
    } catch (err) {
      setSubmissionsError(err.message);
    } finally {
      setSubmissionsLoading(false);
    }
  };

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
          className={`username-input${rateError ? " username-input--error" : ""}`}
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleFetchRate();
              handleFetchSubmissions();
            }
          }}
        />
        <button
          className="username-button"
          onClick={() => {
            handleFetchRate();
            handleFetchSubmissions();
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        {rateError && <span className="username-error">{rateError}</span>}
      </div>
      <Main
        summary={summary}
        allRows={allRows}
        rate={rate}
        rateLoading={rateLoading}
        rateError={rateError}
        submissionsMap={submissionsMap}
        submissionsLoading={submissionsLoading}
        submissionsError={submissionsError}
      />
      <Footer />
    </div>
  );
}
