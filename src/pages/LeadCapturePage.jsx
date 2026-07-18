import { useState } from 'react';
import { useToast } from '../context/ToastContext.jsx';
import { getLeadCount, submitLead } from '../services/leadsService.js';
import '../styles/page-lead-capture.css';

const profileOptions = ['Apostador', 'Trader esportivo', 'Analista', 'Curioso'];
const leadTrustItems = ['Grátis nesta fase', 'Sem assinatura', 'Atualizações prioritárias'];
const valueItems = [
  {
    label: '01',
    title: 'Jogos com maior potencial',
    description: 'Receba leituras priorizadas por score, mercado e contexto estatístico.',
  },
  {
    label: '02',
    title: 'Mercados fortes',
    description: 'Acompanhe sinais de gols, ambas marcam, escanteios e favoritos técnicos.',
  },
  {
    label: '03',
    title: 'Evolução antecipada',
    description: 'Participe da validação do Duque Score antes da abertura completa.',
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
      showToast(result.mode === 'duplicate' ? 'Este e-mail já está na lista VIP.' : 'Você entrou na lista VIP.');
    } catch {
      setSubmitted(true);
      showToast('Cadastro salvo localmente. Integração externa indisponível no momento.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="lead-page">
      <section className="lead-hero" aria-labelledby="lead-title">
        <div className="lead-hero-copy">
          <span>Lista VIP gratuita</span>
          <h1 id="lead-title">Receba as melhores leituras do Duque Score</h1>
          <p>
            Entre no radar gratuito para receber análises, mercados fortes e novidades do produto
            antes das próximas liberações públicas.
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
          <p>usuários acompanhando o acesso gratuito</p>
          <small>Captação aberta</small>
        </aside>
      </section>

      <section className="lead-conversion" aria-label="Cadastro na lista VIP">
        <div className="lead-value-panel">
          <div className="lead-value-header">
            <span>O que você recebe</span>
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
              <strong>Você está na lista VIP.</strong>
              <p>Em breve você receberá novidades e análises gratuitas do Duque Score.</p>
              <small>Se este e-mail já estava cadastrado, mantivemos apenas uma inscrição ativa.</small>
            </div>
          ) : (
            <>
              <div className="lead-form-intro">
                <span>Entrada rápida</span>
                <strong>Cadastre-se gratuitamente</strong>
                <p>Use um e-mail real para receber as próximas atualizações.</p>
                <div className="lead-form-speed" aria-label="Resumo do cadastro">
                  <small>30 segundos</small>
                  <small>Sem cartão</small>
                  <small>Acesso grátis</small>
                </div>
              </div>

              <div className="lead-fields">
                <label>
                  Nome
                  <input
                    autoComplete="name"
                    name="name"
                    onChange={updateField}
                    placeholder="Seu nome"
                    required
                    type="text"
                    value={formData.name}
                  />
                </label>
                <label>
                  E-mail
                  <input
                    autoComplete="email"
                    inputMode="email"
                    name="email"
                    onChange={updateField}
                    placeholder="seuemail@exemplo.com"
                    required
                    type="email"
                    value={formData.email}
                  />
                </label>
                <label>
                  WhatsApp opcional
                  <input
                    autoComplete="tel"
                    inputMode="tel"
                    name="whatsapp"
                    onChange={updateField}
                    placeholder="(00) 00000-0000"
                    type="tel"
                    value={formData.whatsapp}
                  />
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
                {isSubmitting ? 'Enviando cadastro...' : 'Entrar grátis na Lista VIP'}
              </button>
              <p className="lead-form-note">Gratuito. Sem promessa de lucro. Análises estatísticas para estudo.</p>
              <div className="lead-mobile-proof" aria-label="Garantias da lista VIP">
                <span>Sem assinatura</span>
                <span>Sem pagamento</span>
                <span>Cancelamento livre</span>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}

export default LeadCapturePage;
