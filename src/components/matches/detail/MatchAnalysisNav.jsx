import '../../../styles/match-analysis-nav.css';

const analysisLinks = [
  { code: 'PB', href: '#probabilidades', label: 'Probabilidades' },
  { code: 'AI', href: '#projecao-engine', label: 'Engine IA' },
  { code: 'FT', href: '#fundamentos', label: 'Fundamentos' },
  { code: 'R$', href: '#bilhete', label: 'Bilhete' },
];

function MatchAnalysisNav() {
  return (
    <nav className="match-analysis-nav" aria-label="Seções da análise">
      {analysisLinks.map((link) => (
        <a href={link.href} key={link.href}>
          <span aria-hidden="true">{link.code}</span>
          <strong>{link.label}</strong>
        </a>
      ))}
    </nav>
  );
}

export default MatchAnalysisNav;
