import '../../styles/technical-panel.css';

function TechnicalPanel({
  ariaLabel,
  variant = 'neon',
  eyebrow,
  title,
  description,
  asideEyebrow,
  asideTitle,
  asideDescription,
  items,
}) {
  return (
    <section className={`technical-panel technical-panel--${variant}`} aria-label={ariaLabel}>
      <div className="technical-panel__header">
        <div>
          <span>{eyebrow}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <aside>
          <span>{asideEyebrow}</span>
          <strong>{asideTitle}</strong>
          <p>{asideDescription}</p>
        </aside>
      </div>

      <div className="technical-panel__grid">
        {items.map((item) => (
          <article key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TechnicalPanel;
