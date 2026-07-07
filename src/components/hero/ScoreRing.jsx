import '../../styles/hero-score.css';

function ScoreRing({ score }) {
  const ringStyle = {
    '--score-angle': `${score * 3.6}deg`,
  };

  return (
    <div className="score-ring-wrap">
      <div className="score-ring" style={ringStyle}>
        <div className="score-ring-inner">
          <span>Duque Score</span>
          <strong>{score}</strong>
          <small>confiança alta</small>
        </div>
      </div>
    </div>
  );
}

export default ScoreRing;
