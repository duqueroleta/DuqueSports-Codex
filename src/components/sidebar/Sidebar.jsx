import { NavLink } from 'react-router-dom';
import '../../styles/sidebar.css';

const navItems = [
  { label: 'Home', path: '/', code: 'HM' },
  { label: 'Lista VIP', path: '/lista-vip', code: 'VIP' },
  { label: 'Jogos', path: '/jogos', code: 'JG' },
  { label: 'Mercados', path: '/mercados', code: 'MK' },
  { label: 'Auditorias', path: '/auditorias', code: 'AU' },
  { label: 'Analises', path: '/analises', code: 'AN' },
  { label: 'Favoritos', path: '/favoritos', code: 'FV' },
  { label: 'Ao Vivo', path: '/ao-vivo', code: 'LV' },
  { label: 'Dados', path: '/dados', code: 'DT' },
  { label: 'Perfil', path: '/perfil', code: 'PF' },
];

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegacao principal">
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          D
        </div>
        <div>
          <strong>DUQUE</strong>
          <span>Sports AI</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
            key={item.label}
            to={item.path}
          >
            <span className="sidebar-link-code">{item.code}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-pro">
        <span>LISTA VIP</span>
        <strong>Acesso gratuito</strong>
        <p>Receba novidades, auditorias e novas leituras estatisticas do DUQUE.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
