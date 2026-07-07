import { Link } from 'react-router-dom';
import ProFeature from './ProFeature.jsx';
import { getLeadCount } from '../../services/leadsService.js';
import '../../styles/pro-duque.css';

const features = [
  'Acesso gratuito aos sinais e leituras principais',
  'Radar de mercados fortes com auditoria visivel',
  'Prioridade para receber novas analises da IA',
  'Entrada antecipada nas proximas funcionalidades',
];

function DuquePro() {
  const leadCount = getLeadCount();

  return (
    <section className="duque-pro" aria-labelledby="duque-pro-title">
      <div className="duque-pro-content">
        <span className="duque-pro-kicker">ACESSO GRATUITO VIP</span>
        <h2 id="duque-pro-title">Entre na lista e acompanhe a evolucao do Duque Score</h2>
        <p>
          O projeto esta aberto gratuitamente para captar usuarios, validar demanda real e entregar
          analises estatisticas cada vez melhores para futebol.
        </p>

        <div className="duque-pro-features">
          {features.map((feature) => (
            <ProFeature key={feature} label={feature} />
          ))}
        </div>
      </div>

      <aside className="duque-pro-panel">
        <span>Lista VIP aberta</span>
        <strong>{leadCount}+ usuarios</strong>
        <p>Cadastre-se gratuitamente para receber novidades, melhorias e novas leituras do modelo.</p>
        <Link to="/lista-vip">Entrar gratuitamente</Link>
      </aside>
    </section>
  );
}

export default DuquePro;
