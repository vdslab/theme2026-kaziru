export default function AlgorithmCard({ algo, problems }) {
  return (
    <div className="legend">
      <div className="legend-title">選択したアルゴリズム</div>
      <div className="selected-algo-card">
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
        <div className="problems-list">
          <div className="problems-list-title">問題一覧（上位10件）</div>
          {problems.map((problem, i) => (
            <a
              key={i}
              href={problem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="problem-item"
            >
              <span className="problem-id">{problem.problem_id}</span>
              <span className="problem-title">{problem.title}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
