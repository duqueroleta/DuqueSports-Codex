import { Link } from 'react-router-dom';
import ProFeature from './ProFeature.jsx';
import { getLeadCount } from '../../services/leadsService.js';
import '../../styles/pro-duque.css';

const features = [
  'Alertas gratuitos com jogos e mercados em destaque',
  'Radar de mercados fortes com auditoria visível',
  'Prioridade para receber novas leituras estatísticas',
  'Acesso antecipado às próximas funções do Duque Score',
];

function DuquePro() {
  const leadCount = getLeadCount();

  return (
    <section className="duque-pro" aria-labelledby="duque-pro-title">
      <div className="duque-pro-content">
        <span className="duque-pro-kicker">ACESSO GRATUITO VIP</span>
        <h2 id="duque-pro-title">Entre na lista gratuita e receba os melhores sinais primeiro</h2>
        <p>
          O Duque Score está em fase gratuita para validar usuários reais e entregar leituras
          estatísticas cada vez mais úteis para futebol.
        </p>

        <div className="duque-pro-features">
          {features.map((feature) => (
            <ProFeature key={feature} label={feature} />
          ))}
        </div>
      </div>

      <aside className="duque-pro-panel">
        <span>Lista VIP aberta</span>
        <strong>{leadCount}+ usuários</strong>
        <p>Cadastre-se para receber alertas, melhorias e novas leituras antes das liberações públicas.</p>
        <Link to="/lista-vip">Entrar grátis</Link>
      </aside>
    </section>
  );
}

export default DuquePro;
