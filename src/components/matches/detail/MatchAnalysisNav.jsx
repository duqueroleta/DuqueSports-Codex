import '../../../styles/match-analysis-nav.css';

const analysisLinks = [
  { href: '#probabilidades', label: 'Probabilidades' },
  { href: '#projecao-engine', label: 'Engine IA' },
  { href: '#fundamentos', label: 'Fundamentos' },
  { href: '#bilhete', label: 'Bilhete' },
];

function MatchAnalysisNav() {
  return (
    <nav className="match-analysis-nav" aria-label="Seções da análise">
      {analysisLinks.map((link) => (
        <a href={link.href} key={link.href}>{link.label}</a>
      ))}
    </nav>
  );
}

export default MatchAnalysisNav;
