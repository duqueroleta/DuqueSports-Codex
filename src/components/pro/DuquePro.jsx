import ProFeature from './ProFeature.jsx';
import '../../styles/pro-duque.css';

const features = [
  'Modelos avançados para pré-jogo e ao vivo',
  'Auditoria profissional de sinais',
  'Radar de volatilidade por mercado',
  'Alertas premium de oportunidade',
];

function DuquePro() {
  return (
    <section className="duque-pro" aria-labelledby="duque-pro-title">
      <div className="duque-pro-content">
        <span className="duque-pro-kicker">DUQUE PRO</span>
        <h2 id="duque-pro-title">Inteligência premium para decisões de alto nível</h2>
        <p>
          Uma camada avançada para analistas que precisam de velocidade, rastreabilidade e
          leitura estatística mais profunda antes do mercado se mover.
        </p>

        <div className="duque-pro-features">
          {features.map((feature) => (
            <ProFeature key={feature} label={feature} />
          ))}
        </div>
      </div>

      <aside className="duque-pro-panel">
        <span>Plano recomendado</span>
        <strong>PRO Intelligence</strong>
        <p>Sinais priorizados, filtros profissionais e histórico auditável de performance.</p>
        <button type="button">Ativar visão PRO</button>
      </aside>
    </section>
  );
}

export default DuquePro;
