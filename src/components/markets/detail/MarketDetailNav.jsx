import '../../../styles/market-detail-nav.css';

const links = [
  { href: '#oportunidades-relacionadas', label: 'Oportunidades' },
  { href: '#inteligencia-mercado', label: 'Inteligencia' },
  { href: '#auditoria-mercado', label: 'Auditoria' },
];

function MarketDetailNav() {
  return (
    <nav className="market-detail-nav" aria-label="Secoes do mercado">
      {links.map((link) => <a href={link.href} key={link.href}>{link.label}</a>)}
    </nav>
  );
}

export default MarketDetailNav;
