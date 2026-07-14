import { Outlet } from 'react-router-dom';
import AppFooter from './AppFooter.jsx';
import FloatingLeadCta from '../lead/FloatingLeadCta.jsx';
import Sidebar from '../sidebar/Sidebar.jsx';
import Topbar from '../topbar/Topbar.jsx';
import '../../styles/layout-app.css';

function AppLayout() {
  return (
    <div className="app-layout">
      <a className="skip-link" href="#main-content">
        Pular para conteúdo
      </a>
      <Sidebar />
      <div className="app-content" id="main-content">
        <Topbar />
        <Outlet />
        <AppFooter />
      </div>
      <FloatingLeadCta />
    </div>
  );
}

export default AppLayout;
