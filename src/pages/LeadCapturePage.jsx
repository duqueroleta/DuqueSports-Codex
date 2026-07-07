import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { getLeadCount, submitLead } from '../services/leadsService.js';
import '../styles/page-lead-capture.css';

const profileOptions = ['Apostador', 'Trader esportivo', 'Analista', 'Curioso'];
const leadTrustItems = ['Sem custo', 'Dados mockados nesta fase', 'Novidades por prioridade'];

function LeadCapturePage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    profile: profileOptions[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [leadCount, setLeadCount] = useState(() => getLeadCount());
  const { showToast } = useToast();

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
  }

  async function saveLead(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitLead(formData);
      setSubmitted(true);
      setLeadCount(getLeadCount());
      showToast(result.mode === 'duplicate' ? 'Este e-mail ja esta na lista VIP.' : 'Voce entrou na lista VIP.');
    } catch {
      setSubmitted(true);
      showToast('Cadastro salvo localmente. Integracao externa indisponivel no momento.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="lead-page">
      <section className="lead-hero" aria-labelledby="lead-title">
        <div>
          <span>Acesso gratuito</span>
          <h1 id="lead-title">Receba analises gratuitas do DUQUE Sports AI</h1>
          <p>
            Entre na lista VIP para acompanhar sinais, mercados fortes e leituras estatisticas
            antes das proximas atualizacoes publicas.
          </p>
          <div className="lead-trust-list" aria-label="Diferenciais da lista VIP">
            {leadTrustItems.map((item) => (
              <strong key={item}>{item}</strong>
            ))}
          </div>
        </div>

        <aside className="lead-summary">
          <span>Lista VIP</span>
          <strong>{leadCount}+</strong>
          <p>analistas acompanhando o acesso gratuito</p>
          <small>Entrada aberta para validacao do produto</small>
        </aside>
      </section>

      <section className="lead-content">
        <div className="lead-benefits">
          <article>
            <span>01</span>
            <strong>Analises priorizadas</strong>
            <p>Receba leituras de jogos e mercados com maior potencial estatistico.</p>
          </article>
          <article>
            <span>02</span>
            <strong>Radar de oportunidades</strong>
            <p>Acompanhe sinais de gols, ambas marcam, escanteios e favoritos.</p>
          </article>
          <article>
            <span>03</span>
            <strong>Acesso antecipado</strong>
            <p>Participe da evolucao do produto antes da abertura completa ao publico.</p>
          </article>
        </div>

        <form className="lead-form" onSubmit={saveLead}>
          {submitted ? (
            <div className="lead-success">
              <span>Cadastro confirmado</span>
              <strong>Voce esta na lista VIP.</strong>
              <p>Se este e-mail ja estava cadastrado, mantivemos apenas uma inscricao ativa.</p>
            </div>
          ) : (
            <>
              <div className="lead-form-intro">
                <span>Entrada em 30 segundos</span>
                <strong>Cadastre-se gratuitamente</strong>
                <p>Use um e-mail real para receber as proximas atualizacoes do DUQUE Sports AI.</p>
              </div>
              <label>
                Nome
                <input name="name" onChange={updateField} required type="text" value={formData.name} />
              </label>
              <label>
                E-mail
                <input name="email" onChange={updateField} required type="email" value={formData.email} />
              </label>
              <label>
                WhatsApp opcional
                <input name="whatsapp" onChange={updateField} type="tel" value={formData.whatsapp} />
              </label>
              <label>
                Perfil
                <select name="profile" onChange={updateField} value={formData.profile}>
                  {profileOptions.map((profile) => (
                    <option key={profile} value={profile}>
                      {profile}
                    </option>
                  ))}
                </select>
              </label>
              <button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Enviando cadastro...' : 'Entrar na lista VIP'}
              </button>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

export default LeadCapturePage;
