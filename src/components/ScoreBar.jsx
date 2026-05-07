import { getScoreBand } from "../utils/statusHelpers.js";

export default function ScoreBar({ score }) {
  return (
    <div className={`score-bar ${getScoreBand(score)}`}>
      <span style={{ width: `${score}%` }} />
      <strong>{score}</strong>
    </div>
  );
}
