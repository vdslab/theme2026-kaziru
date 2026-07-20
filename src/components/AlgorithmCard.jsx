import DiffCircle from "./DiffCircle/DiffCircle";
import { getDiffColor } from "../utils/diffColors";

export default function AlgorithmCard({ algo, problems, submissionsMap }) {
  const getProblemStatusClass = (problemId) => {
    const status = submissionsMap.get(problemId);
    if (status === true) return "problem-item--ac";
    if (status === false) return "problem-item--wa";
    return "";
  };

  if (!algo) {
    return (
      <div className="legend">
        <div className="legend-title">選択したアルゴリズム</div>
        <div className="selected-algo-card">
          <div className="selected-algo-info">
            <div className="selected-algo-header">
              <div className="selected-algo-name">---</div>
            </div>
            <div className="selected-algo-stats">
              <div className="stat-row">
                <span className="stat-label">出現レート帯の中央値</span>
                <span className="stat-value">---</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">問題数</span>
                <span className="stat-value">---</span>
              </div>
            </div>
          </div>
          <div className="problems-list">
            <div className="problems-list-title">問題一覧</div>
            <div className="problems-list--empty">
              ノード（アルゴリズム）を選択してください
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="legend">
      <div className="legend-title">選択したアルゴリズム</div>
      <div className="selected-algo-card">
        <div className="selected-algo-info">
          <div className="selected-algo-header">
            <div className="selected-algo-name">{algo.algo}</div>
          </div>
          <div className="selected-algo-stats">
            <div className="stat-row">
              <span className="stat-label">出現レート帯の中央値</span>
              <span className="stat-value">{Math.round(algo.median)}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">問題数</span>
              <span className="stat-value">{algo.n} 問</span>
            </div>
          </div>
        </div>
        <div className="problems-list">
          <div className="problems-list-title">問題一覧</div>
          {problems.map((problem, i) => (
            <a
              key={i}
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`problem-item ${getProblemStatusClass(problem.problem_id)}`}
            >
              <DiffCircle difficulty={problem.difficulty} diffBand={problem.diff_band} />
              <span className="problem-id" style={{ color: getDiffColor(problem.diff_band) }}>{problem.problem_id}</span>
              <span className="problem-title" style={{ color: getDiffColor(problem.diff_band) }}>{problem.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
