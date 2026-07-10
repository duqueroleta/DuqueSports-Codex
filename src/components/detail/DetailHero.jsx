import { Link } from 'react-router-dom';
import '../../styles/detail-hero.css';

function DetailHero({
  backHref,
  backLabel,
  children,
  description,
  eyebrow,
  scoreCaption,
  scoreLabel,
  scoreValue,
  style,
  title,
  titleId,
}) {
  return (
    <section className="detail-hero" aria-labelledby={titleId} style={style}>
      <div>
        <Link to={backHref}>{backLabel}</Link>
        <span>{eyebrow}</span>
        <h1 id={titleId}>{title}</h1>
        {children}
        <p>{description}</p>
      </div>

      <aside className="detail-score-panel">
        <span>{scoreLabel}</span>
        <strong>{scoreValue}</strong>
        <p>{scoreCaption}</p>
      </aside>
    </section>
  );
}

export default DetailHero;
