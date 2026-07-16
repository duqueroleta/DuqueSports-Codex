import { Link } from 'react-router-dom';
import DevFailurePanel from '../components/profile/DevFailurePanel.jsx';
import ResetPreferencesPanel from '../components/profile/ResetPreferencesPanel.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { competitions } from '../data/competitions.js';
import { usePersistentState } from '../hooks/usePersistentState.js';
import '../styles/page-profile.css';

const PROFILE_KEY = 'duque.profile.userType';
const EXPERIENCE_KEY = 'duque.profile.experience';
const MARKETS_KEY = 'duque.profile.markets';
const COMPETITIONS_KEY = 'duque.profile.competitions';

const userTypes = ['Apostador', 'Trader esportivo', 'Analista', 'Curioso'];
const experienceLevels = ['Iniciante', 'Intermediário', 'Avançado'];
const marketPreferences = ['Over gols', 'Ambas marcam', 'Escanteios', 'Resultado final', 'Dupla chance', 'Handicap'];
const featuredCompetitions = competitions.slice(0, 8);

function toggleItem(items, item) {
  return items.includes(item) ? items.filter((currentItem) => currentItem !== item) : [...items, item];
}

function getProfileNextStep({ favoriteMatches, favoriteMarkets, personalizationScore }) {
  const totalFavorites = favoriteMatches.length + favoriteMarkets.length;

  if (personalizationScore >= 80 && totalFavorites > 0) {
    return {
      href: '/favoritos',
      label: 'Abrir radar pessoal',
      status: 'Perfil ativo',
      text: 'Seu radar já tem preferências e favoritos suficientes para leitura personalizada.',
    };
  }

  if (personalizationScore >= 68) {
    return {
      href: '/lista-vip',
      label: 'Entrar na Lista VIP',
      status: 'Pronto para VIP',
      text: 'Perfil configurado para receber análises gratuitas e novidades prioritárias.',
    };
  }

  return {
    href: '/jogos',
    label: 'Selecionar jogos',
    status: 'Configure seu radar',
    text: 'Escolha mercados, campeonatos e favoritos para melhorar a personalização.',
  };
}

function ProfilePage() {
  const { favoriteMatches, favoriteMarkets } = useFavorites();
  const [userType, setUserType] = usePersistentState(PROFILE_KEY, userTypes[0]);
  const [experience, setExperience] = usePersistentState(EXPERIENCE_KEY, experienceLevels[1]);
  const [selectedMarkets, setSelectedMarkets] = usePersistentState(MARKETS_KEY, ['Over gols', 'Ambas marcam']);
  const [selectedCompetitions, setSelectedCompetitions] = usePersistentState(
    COMPETITIONS_KEY,
    ['Copa do Mundo', 'Brasileirão', 'Champions League'],
  );
  const personalizationScore = Math.min(
    100,
    42 + selectedMarkets.length * 7 + selectedCompetitions.length * 6 + favoriteMatches.length * 4 + favoriteMarkets.length * 4,
  );
  const profileMetrics = [
    {
      label: 'Perfil',
      value: userType,
      description: `${experience} dentro do Duque Score`,
    },
    {
      label: 'Personalização',
      value: `${personalizationScore}%`,
      description: 'base local para recomendações futuras',
    },
    {
      label: 'Mercados',
      value: selectedMarkets.length,
      description: 'preferências de leitura estatística',
    },
    {
      label: 'Favoritos',
      value: favoriteMatches.length + favoriteMarkets.length,
      description: 'jogos e mercados salvos neste navegador',
    },
  ];
  const nextStep = getProfileNextStep({ favoriteMatches, favoriteMarkets, personalizationScore });

  return (
    <main className="profile-page">
      <section className="profile-hero" aria-labelledby="profile-title">
        <div className="profile-hero-copy">
          <span>Perfil gratuito</span>
          <h1 id="profile-title">Configure sua leitura do Duque Score</h1>
          <p>
            Preferências locais para entender seus campeonatos, mercados e nível de experiência.
            Esses dados ajudam a preparar uma experiência cada vez mais personalizada.
          </p>
        </div>

        <aside className="profile-score-card" aria-label="Resumo do perfil">
          <span>Nível atual</span>
          <strong>VIP</strong>
          <p>Acesso gratuito habilitado para captação e relacionamento.</p>
          <small>{personalizationScore}% personalizado</small>
        </aside>
      </section>

      <section className="profile-metrics" aria-label="Indicadores do perfil">
        {profileMetrics.map((metric) => (
          <article key={metric.label}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
            <p>{metric.description}</p>
          </article>
        ))}
      </section>

      <section className="profile-next-step" aria-label="Próximo passo do perfil">
        <div>
          <span>{nextStep.status}</span>
          <strong>{nextStep.text}</strong>
        </div>
        <Link to={nextStep.href}>{nextStep.label}</Link>
      </section>

      <section className="profile-preferences" aria-label="Preferências do usuário">
        <article className="profile-panel">
          <div className="profile-panel-header">
            <span>Tipo de usuário</span>
            <strong>Como você usa as análises</strong>
          </div>

          <div className="profile-segmented" aria-label="Tipo de usuário">
            {userTypes.map((type) => (
              <button
                aria-pressed={userType === type}
                className={userType === type ? 'profile-option-active' : ''}
                key={type}
                onClick={() => setUserType(type)}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="profile-levels" aria-label="Nível de experiência">
            {experienceLevels.map((level) => (
              <button
                aria-pressed={experience === level}
                className={experience === level ? 'profile-option-active' : ''}
                key={level}
                onClick={() => setExperience(level)}
                type="button"
              >
                {level}
              </button>
            ))}
          </div>
        </article>

        <article className="profile-panel">
          <div className="profile-panel-header">
            <span>Mercados</span>
            <strong>Prioridades de leitura</strong>
          </div>

          <div className="profile-chip-grid" aria-label="Mercados preferidos">
            {marketPreferences.map((market) => (
              <button
                aria-pressed={selectedMarkets.includes(market)}
                className={selectedMarkets.includes(market) ? 'profile-option-active' : ''}
                key={market}
                onClick={() => setSelectedMarkets((items) => toggleItem(items, market))}
                type="button"
              >
                {market}
              </button>
            ))}
          </div>
        </article>

        <article className="profile-panel profile-panel-wide">
          <div className="profile-panel-header">
            <span>Campeonatos</span>
            <strong>Competicoes favoritas para o radar inicial</strong>
          </div>

          <div className="profile-competition-grid" aria-label="Campeonatos preferidos">
            {featuredCompetitions.map((competition) => (
              <button
                aria-pressed={selectedCompetitions.includes(competition.label)}
                className={selectedCompetitions.includes(competition.label) ? 'profile-option-active' : ''}
                key={competition.id}
                onClick={() => setSelectedCompetitions((items) => toggleItem(items, competition.label))}
                type="button"
              >
                <span>{competition.region}</span>
                <strong>{competition.label}</strong>
              </button>
            ))}
          </div>
        </article>
      </section>

      <DevFailurePanel />
      <ResetPreferencesPanel />
    </main>
  );
}

export default ProfilePage;
