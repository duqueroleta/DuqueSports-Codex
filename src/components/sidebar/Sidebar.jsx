import { NavLink } from 'react-router-dom';
import '../../styles/sidebar.css';

const desktopNavItems = [
  { label: 'Home', path: '/', code: 'HM' },
  { label: 'Lista VIP', path: '/lista-vip', code: 'VIP' },
  { label: 'Jogos', path: '/jogos', code: 'JG' },
  { label: 'Mercados', path: '/mercados', code: 'MK' },
  { label: 'Auditorias', path: '/auditorias', code: 'AU' },
  { label: 'Análises', path: '/analises', code: 'AN' },
  { label: 'Favoritos', path: '/favoritos', code: 'FV' },
  { label: 'Ao Vivo', path: '/ao-vivo', code: 'LV' },
  { label: 'Dados', path: '/dados', code: 'DT' },
  { label: 'Perfil', path: '/perfil', code: 'PF' },
];

const mobileNavItems = [
  { label: 'Home', path: '/', code: 'HM' },
  { label: 'Jogos', path: '/jogos', code: 'JG' },
  { label: 'VIP', path: '/lista-vip', code: 'VIP', featured: true },
  { label: 'Ao vivo', path: '/ao-vivo', code: 'LV' },
  { label: 'Perfil', path: '/perfil', code: 'PF' },
];

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Navegação principal">
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          D
        </div>
        <div>
          <strong>DUQUE</strong>
          <span>Score</span>
        </div>
      </div>

      <nav className="sidebar-nav sidebar-nav-desktop" aria-label="Navegação principal desktop">
        {desktopNavItems.map((item) => (
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

      <nav className="sidebar-nav-mobile" aria-label="Navegação principal mobile">
        {mobileNavItems.map((item) => (
          <NavLink
            className={({ isActive }) => {
              const activeClass = isActive ? ' mobile-nav-link-active' : '';
              const featuredClass = item.featured ? ' mobile-nav-link-featured' : '';

              return `mobile-nav-link${activeClass}${featuredClass}`;
            }}
            key={item.label}
            to={item.path}
          >
            <span className="mobile-nav-code">{item.code}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-pro">
        <span>LISTA VIP</span>
        <strong>Acesso gratuito</strong>
        <p>Receba novidades, auditorias e novas leituras estatísticas do Duque Score.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
