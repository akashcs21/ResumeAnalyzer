// ScoreCard — Displays resume analysis score
export default function ScoreCard({ score, breakdown }) {
  return (
    <div className="score-card">
      <h3>Resume Score</h3>
      <p className="score">{score ?? "--"}/100</p>
      {/* Score breakdown details */}
    </div>
  );
}
