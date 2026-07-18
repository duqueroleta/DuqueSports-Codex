import { Link, useLocation } from 'react-router-dom';
import '../../styles/floating-lead-cta.css';

function FloatingLeadCta() {
  const location = useLocation();

  if (location.pathname === '/lista-vip') {
    return null;
  }

  return (
    <Link className="floating-lead-cta" to="/lista-vip">
      <span>Lista VIP</span>
      <strong>Receber alertas grátis</strong>
    </Link>
  );
}

export default FloatingLeadCta;
