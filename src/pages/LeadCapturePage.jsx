import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { getLeadCount, submitLead } from '../services/leadsService.js';
import '../styles/page-lead-capture.css';

const profileOptions = ['Apostador', 'Trader esportivo', 'Analista', 'Curioso'];
const leadTrustItems = ['Gratis nesta fase', 'Sem assinatura', 'Atualizacoes prioritarias'];
const valueItems = [
  {
    label: '01',
    title: 'Jogos com maior potencial',
    description: 'Receba leituras priorizadas por score, mercado e contexto estatistico.',
  },
  {
    label: '02',
    title: 'Mercados fortes',
    description: 'Acompanhe sinais de gols, ambas marcam, escanteios e favoritos tecnicos.',
  },
  {
    label: '03',
    title: 'Evolucao antecipada',
    description: 'Participe da validacao do DUQUE Score antes da abertura completa.',
  },
];

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
        <div className="lead-hero-copy">
          <span>Lista VIP gratuita</span>
          <h1 id="lead-title">Receba as melhores leituras do DUQUE Score</h1>
          <p>
            Entre no radar gratuito para receber analises, mercados fortes e novidades do produto
            antes das proximas liberacoes publicas.
          </p>
          <div className="lead-trust-list" aria-label="Diferenciais da lista VIP">
            {leadTrustItems.map((item) => (
              <strong key={item}>{item}</strong>
            ))}
          </div>
        </div>

        <aside className="lead-summary">
          <span>Fila atual</span>
          <strong>{leadCount}+</strong>
          <p>usuarios acompanhando o acesso gratuito</p>
          <small>Captacao aberta</small>
        </aside>
      </section>

      <section className="lead-conversion" aria-label="Cadastro na lista VIP">
        <div className="lead-value-panel">
          <div className="lead-value-header">
            <span>O que voce recebe</span>
            <strong>Uma lista curta do que importa para apostar melhor</strong>
          </div>

          <div className="lead-benefits">
            {valueItems.map((item) => (
              <article key={item.label}>
                <span>{item.label}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>

        <form className="lead-form" onSubmit={saveLead}>
          {submitted ? (
            <div className="lead-success">
              <span>Cadastro confirmado</span>
              <strong>Voce esta na lista VIP.</strong>
              <p>Em breve voce recebera novidades e analises gratuitas do DUQUE Score.</p>
              <small>Se este e-mail ja estava cadastrado, mantivemos apenas uma inscricao ativa.</small>
            </div>
          ) : (
            <>
              <div className="lead-form-intro">
                <span>Entrada rapida</span>
                <strong>Cadastre-se gratuitamente</strong>
                <p>Use um e-mail real para receber as proximas atualizacoes.</p>
              </div>

              <div className="lead-fields">
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
              </div>

              <button disabled={isSubmitting} type="submit">
                {isSubmitting ? 'Enviando cadastro...' : 'Entrar na lista VIP'}
              </button>
              <p className="lead-form-note">Gratuito. Sem promessa de lucro. Analises estatisticas para estudo.</p>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

export default LeadCapturePage;
