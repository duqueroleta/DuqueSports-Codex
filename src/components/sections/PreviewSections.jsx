import { Link } from 'react-router-dom';
import '../../styles/sections-preview.css';

const sections = [
  { label: 'Jogos do Dia', path: '/jogos', status: 'ativo' },
  { label: 'Mercados Fortes', path: '/mercados', status: 'ativo' },
  { label: 'Ultimas Auditorias', path: '/auditorias', status: 'ativo' },
  { label: 'Analises', path: '/analises', status: 'gratuito' },
  { label: 'Ao Vivo', path: '/ao-vivo', status: 'gratuito' },
  { label: 'Dados', path: '/dados', status: 'mockado' },
  { label: 'Favoritos', path: '/favoritos', status: 'personalizar' },
  { label: 'Perfil', path: '/perfil', status: 'local' },
  { label: 'Lista VIP', path: '/lista-vip', status: 'aberta' },
  { label: 'Novas funcoes', path: '/lista-vip', status: 'em breve' },
];

function PreviewSections() {
  return (
    <section className="preview-sections" aria-label="Mapa gratuito do produto">
      <div className="preview-sections-heading">
        <span>Produto gratuito</span>
        <h2>Explore o ecossistema DUQUE Sports AI</h2>
      </div>

      <div className="preview-sections-grid">
        {sections.map((section, index) => (
          <Link className="preview-card" key={section.label} to={section.path}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{section.label}</h3>
            <small>{section.status}</small>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default PreviewSections;
