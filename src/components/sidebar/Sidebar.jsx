import { NavLink } from 'react-router-dom';
import '../../styles/sidebar.css';

const navItems = [
  { label: 'Home', path: '/', code: 'HM' },
  { label: 'Jogos', path: '/jogos', code: 'JG' },
  { label: 'Mercados', path: '/mercados', code: 'MK' },
  { label: 'Auditorias', path: '/auditorias', code: 'AU' },
  { label: 'Análises', path: '/analises', code: 'AN' },
  { label: 'Favoritos', path: '/favoritos', code: 'FV' },
  { label: 'Ao Vivo', path: '/ao-vivo', code: 'LV' },
  { label: 'Dados', path: '/dados', code: 'DT' },
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
        <span>DUQUE PRO</span>
        <strong>Precisão avançada</strong>
        <p>Modelos premium, auditoria de sinais e leitura de volatilidade.</p>
      </div>
    </aside>
  );
}

export default Sidebar;
