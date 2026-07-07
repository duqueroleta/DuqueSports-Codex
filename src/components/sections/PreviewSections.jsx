import '../../styles/sections-preview.css';

const sections = [
  'Jogos do Dia',
  'Mercados Fortes',
  'Últimas Auditorias',
  'Estatísticas Globais',
  'Duque PRO',
  'Perfil',
  'Favoritos',
  'Análises',
  'Ao Vivo',
  'Dados',
];

function PreviewSections() {
  return (
    <section className="preview-sections" aria-label="Próximas seções">
      {sections.map((section, index) => (
        <article className="preview-card" key={section}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <h2>{section}</h2>
        </article>
      ))}
    </section>
  );
}

export default PreviewSections;
