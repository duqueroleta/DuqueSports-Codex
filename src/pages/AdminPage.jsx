import { useMemo, useState } from 'react';
import { parseSmartInput } from '../services/adminSmartInputParser.js';
import { buildAdminEngineProjection, buildProjectedStats } from '../services/adminProjectionService.js';
import { publishAdminProjection } from '../services/publishedProjectionService.js';
import '../styles/page-admin.css';

const initialForm = {
  awayCorners: 4.8,
  awayName: 'Gana',
  awayPossession: 48,
  awayRecentMatches: [],
  awayShots: 11,
  awayShotsOnTarget: 4,
  awayXg: 1.05,
  competition: 'Copa do Mundo',
  date: '2026-07-21',
  homeCorners: 6.2,
  homeName: 'Colombia',
  homePossession: 52,
  homeRecentMatches: [],
  homeShots: 15,
  homeShotsOnTarget: 5,
  homeXg: 1.96,
  odds: 1.82,
  time: '18:30',
};

const teamFields = [
  { key: 'Xg', label: 'xG medio' },
  { key: 'Shots', label: 'Finalizacoes' },
  { key: 'ShotsOnTarget', label: 'No alvo' },
  { key: 'Corners', label: 'Escanteios' },
  { key: 'Possession', label: 'Posse media' },
];

function range(value, spread, decimals = 0) {
  const start = Math.max(0, value - spread);
  const end = value + spread;

  return `${start.toFixed(decimals)}-${end.toFixed(decimals)}`;
}

function buildProjection(form) {
  const engineProjection = buildAdminEngineProjection(form);

  if (engineProjection.blocked) {
    return {
      confidence: engineProjection.dataQualityScore,
      engineVersion: engineProjection.engineVersion,
      leader: 'Projecao bloqueada por qualidade insuficiente dos dados',
      rows: [],
      status: 'blocked',
      summary: engineProjection.issues?.[0] ?? 'Revise os dados informados antes de gerar a projecao.',
    };
  }

  const stats = buildProjectedStats(engineProjection);
  const recommendedMarket = engineProjection.aiExplanation?.recommendedMarket?.market ?? form.homeName;
  const probableRows = stats.rows?.length ? stats.rows : null;

  return {
    confidence: engineProjection.confidence,
    engineVersion: engineProjection.engineVersion,
    leader: recommendedMarket,
    rows: probableRows ?? [
      { label: 'xG', away: range(stats.awayGoals, 0.28, 2), home: range(stats.homeGoals, 0.28, 2) },
      { label: 'Gols', away: range(stats.awayGoals, 0.45), home: range(stats.homeGoals, 0.45) },
      { label: 'xGOT', away: range(stats.awayXgot, 0.25, 2), home: range(stats.homeXgot, 0.25, 2) },
      { label: 'Finalizacoes', away: range(stats.awayShots, 2), home: range(stats.homeShots, 2) },
      { label: 'No alvo', away: range(stats.awayShotsOnTarget, 1), home: range(stats.homeShotsOnTarget, 1) },
      { label: 'Escanteios', away: range(stats.awayCorners, 1), home: range(stats.homeCorners, 1) },
      { label: 'Posse', away: `${Math.round(stats.awayPossession - 3)}-${Math.round(stats.awayPossession + 3)}%`, home: `${Math.round(stats.homePossession - 3)}-${Math.round(stats.homePossession + 3)}%` },
    ],
    status: 'completed',
    summary: engineProjection.aiExplanation?.headline ?? 'Projecao estatistica gerada pelo engine.',
  };
}

function AdminPage() {
  const [form, setForm] = useState(initialForm);
  const [publishStatus, setPublishStatus] = useState('Apos revisar, publique para exibir na Home e em Jogos.');
  const [smartInput, setSmartInput] = useState('');
  const [smartStatus, setSmartStatus] = useState('Cole os dados do confronto para a IA estruturar a primeira projecao.');
  const projection = useMemo(() => buildProjection(form), [form]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function applySmartInput() {
    if (!smartInput.trim()) {
      setSmartStatus('Cole primeiro os dados recentes dos dois times.');
      return;
    }

    const parsedForm = parseSmartInput(smartInput, form);
    const homeCount = parsedForm.homeRecentMatches.length;
    const awayCount = parsedForm.awayRecentMatches.length;

    setForm(parsedForm);
    setSmartStatus(
      homeCount >= 3 && awayCount >= 3
        ? `Dados interpretados com historico recente: ${homeCount} jogos do mandante e ${awayCount} do visitante.`
        : 'Dados interpretados. Para maior precisao, cole pelo menos 3 jogos recentes de cada time.',
    );
  }

  function publishProjection() {
    const result = publishAdminProjection(form);

    setPublishStatus(
      result.ok
        ? `${result.match.home} x ${result.match.away} publicado na Home e em Jogos.`
        : `Nao foi possivel publicar: ${result.reason}`,
    );
  }

  function renderTeamFields(prefix, teamLabel) {
    return (
      <fieldset className="admin-team-panel">
        <legend>{teamLabel}</legend>
        <label>
          Nome do time
          <input
            onChange={(event) => updateField(`${prefix}Name`, event.target.value)}
            type="text"
            value={form[`${prefix}Name`]}
          />
        </label>

        <div className="admin-field-grid">
          {teamFields.map((field) => {
            const fieldName = `${prefix}${field.key}`;

            return (
              <label key={fieldName}>
                {field.label}
                <input
                  min="0"
                  onChange={(event) => updateField(fieldName, event.target.value)}
                  step="0.01"
                  type="number"
                  value={form[fieldName]}
                />
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <main className="admin-page">
      <header className="admin-hero">
        <div>
          <span>Painel administrativo</span>
          <h1>Cadastrar jogo para projecao</h1>
          <p>Primeira versao mockada. Os dados preenchidos aqui ainda nao salvam em banco.</p>
        </div>
        <strong>Privado</strong>
      </header>

      <section className="admin-layout">
        <form className="admin-form">
          <section className="admin-smart-panel" aria-label="Entrada inteligente de dados">
            <div>
              <span>Entrada inteligente</span>
              <h2>Colar dados do confronto</h2>
              <p>
                Cole aqui os dados que hoje voce envia no ChatGPT. O sistema interpreta texto do
                Flashscore, blocos de ultimos jogos e campos manuais.
              </p>
            </div>

            <textarea
              onChange={(event) => setSmartInput(event.target.value)}
              placeholder={`Confronto Colombia x Gana
Campeonato: Copa do Mundo
Data: 21/07/2026
Horario: 18:30
Odd media: 1.82

Mandante: Colombia
xG: 1.96
Finalizacoes: 15
No alvo: 5
Escanteios: 6.2
Posse: 52
Jogo 1: xG 2.10 | xGOT 1.80 | Finalizacoes 16 | No alvo 6 | Gols 2
Jogo 2: xG 1.72 | xGOT 1.44 | Finalizacoes 14 | No alvo 5 | Gols 1
Jogo 3: xG 2.04 | xGOT 1.70 | Finalizacoes 15 | No alvo 5 | Gols 2

Visitante: Gana
xG: 1.05
Finalizacoes: 11
No alvo: 4
Escanteios: 4.8
Posse: 48
Jogo 1: xG 1.18 | xGOT 0.98 | Finalizacoes 12 | No alvo 4 | Gols 1
Jogo 2: xG 0.92 | xGOT 0.76 | Finalizacoes 10 | No alvo 3 | Gols 0
Jogo 3: xG 1.04 | xGOT 0.86 | Finalizacoes 11 | No alvo 4 | Gols 1`}
              value={smartInput}
            />

            <div className="admin-smart-actions">
              <button onClick={applySmartInput} type="button">Interpretar dados</button>
              <p>{smartStatus}</p>
            </div>
          </section>

          <fieldset className="admin-match-panel">
            <legend>Dados do jogo</legend>
            <div className="admin-field-grid">
              <label>
                Campeonato
                <input
                  onChange={(event) => updateField('competition', event.target.value)}
                  type="text"
                  value={form.competition}
                />
              </label>
              <label>
                Data
                <input
                  onChange={(event) => updateField('date', event.target.value)}
                  type="date"
                  value={form.date}
                />
              </label>
              <label>
                Horario
                <input
                  onChange={(event) => updateField('time', event.target.value)}
                  type="time"
                  value={form.time}
                />
              </label>
              <label>
                Odd media
                <input
                  min="1"
                  onChange={(event) => updateField('odds', event.target.value)}
                  step="0.01"
                  type="number"
                  value={form.odds}
                />
              </label>
            </div>
          </fieldset>

          {renderTeamFields('home', 'Mandante')}
          {renderTeamFields('away', 'Visitante')}
        </form>

        <aside className="admin-preview" aria-label="Previa da projecao">
          <span>Previa gerada</span>
          <h2>{form.homeName} x {form.awayName}</h2>
          <p>{projection.summary}</p>

          <div className="admin-score-preview">
            <strong>{projection.confidence}</strong>
            <small>Duque Score estimado</small>
          </div>

          <div className="admin-projection-list">
            <div>
              <strong>Estatistica</strong>
              <strong>{form.homeName}</strong>
              <strong>{form.awayName}</strong>
            </div>
            {projection.rows.map((row) => (
              <div key={row.label}>
                <span>{row.label}</span>
                <b>{row.home}</b>
                <b>{row.away}</b>
              </div>
            ))}
          </div>

          <div className="admin-publish-actions">
            <button onClick={publishProjection} type="button">Publicar projecao</button>
            <p>{publishStatus}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default AdminPage;
