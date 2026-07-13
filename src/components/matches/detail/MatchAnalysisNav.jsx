import '../../../styles/match-analysis-nav.css';

const analysisLinks = [
  { href: '#probabilidades', label: 'Probabilidades' },
  { href: '#projecao-engine', label: 'Projecao IA' },
  { href: '#fundamentos', label: 'Fundamentos' },
];

function MatchAnalysisNav() {
  return (
    <nav className="match-analysis-nav" aria-label="Secoes da analise">
      {analysisLinks.map((link) => (
        <a href={link.href} key={link.href}>{link.label}</a>
      ))}
    </nav>
  );
}

export default MatchAnalysisNav;
