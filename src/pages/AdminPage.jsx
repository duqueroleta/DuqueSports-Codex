import { useMemo, useState } from 'react';
import '../styles/page-admin.css';

const initialForm = {
  awayCorners: 4.8,
  awayName: 'Gana',
  awayPossession: 48,
  awayShots: 11,
  awayShotsOnTarget: 4,
  awayXg: 1.05,
  competition: 'Copa do Mundo',
  date: '2026-07-21',
  homeCorners: 6.2,
  homeName: 'Colombia',
  homePossession: 52,
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

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeText(value) {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function parseNumericValue(value) {
  const parsed = Number(String(value).replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : null;
}

function readMetric(block, aliases, fallback, blockedTerms = []) {
  const lines = String(block).split(/\r?\n|;/);
  const foundLine = lines.find((line) => {
    const normalizedLine = normalizeText(line);
    const hasAlias = aliases.some((alias) => normalizedLine.includes(alias));
    const hasBlockedTerm = blockedTerms.some((term) => normalizedLine.includes(term));

    return hasAlias && !hasBlockedTerm;
  });

  const value = foundLine?.match(/(\d+(?:[,.]\d+)?)/)?.[1];
  return value ? parseNumericValue(value) ?? fallback : fallback;
}

function readTextValue(text, aliases, fallback) {
  const lines = String(text).split(/\r?\n|;/);
  const foundLine = lines.find((line) => {
    const normalizedLine = normalizeText(line);
    return aliases.some((alias) => normalizedLine.startsWith(alias));
  });

  if (!foundLine) {
    return fallback;
  }

  const [, value] = foundLine.split(/[:=-]/);
  return value?.trim() || fallback;
}

function readDateValue(text, fallback) {
  const isoDate = String(text).match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0];
  if (isoDate) {
    return isoDate;
  }

  const brDate = String(text).match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/);
  return brDate ? `${brDate[3]}-${brDate[2]}-${brDate[1]}` : fallback;
}

function readTimeValue(text, fallback) {
  return String(text).match(/\b(?:[01]?\d|2[0-3]):[0-5]\d\b/)?.[0] || fallback;
}

function getSection(text, startAliases, endAliases) {
  const lines = String(text).split(/\r?\n/);
  const startIndex = lines.findIndex((line) => {
    const normalizedLine = normalizeText(line);
    return startAliases.some((alias) => normalizedLine.startsWith(alias));
  });

  if (startIndex === -1) {
    return text;
  }

  const endIndex = lines.findIndex((line, index) => {
    const normalizedLine = normalizeText(line);
    return index > startIndex && endAliases.some((alias) => normalizedLine.startsWith(alias));
  });

  return lines.slice(startIndex, endIndex === -1 ? undefined : endIndex).join('\n');
}

function parseSmartInput(text, currentForm) {
  const homeBlock = getSection(text, ['mandante', 'casa', 'home'], ['visitante', 'fora', 'away']);
  const awayBlock = getSection(text, ['visitante', 'fora', 'away'], ['mandante', 'casa', 'home']);
  const odds = readMetric(text, ['odd', 'odds', 'odd media'], currentForm.odds);

  return {
    ...currentForm,
    awayCorners: readMetric(awayBlock, ['escanteios', 'corners'], currentForm.awayCorners),
    awayName: readTextValue(text, ['visitante', 'fora', 'away'], currentForm.awayName),
    awayPossession: readMetric(awayBlock, ['posse'], currentForm.awayPossession),
    awayShots: readMetric(awayBlock, ['finalizacoes', 'chutes'], currentForm.awayShots, ['alvo']),
    awayShotsOnTarget: readMetric(awayBlock, ['no alvo', 'chutes no alvo'], currentForm.awayShotsOnTarget),
    awayXg: readMetric(awayBlock, ['xg', 'expected goals'], currentForm.awayXg),
    competition: readTextValue(text, ['campeonato', 'competicao', 'competição'], currentForm.competition),
    date: readDateValue(text, currentForm.date),
    homeCorners: readMetric(homeBlock, ['escanteios', 'corners'], currentForm.homeCorners),
    homeName: readTextValue(text, ['mandante', 'casa', 'home'], currentForm.homeName),
    homePossession: readMetric(homeBlock, ['posse'], currentForm.homePossession),
    homeShots: readMetric(homeBlock, ['finalizacoes', 'chutes'], currentForm.homeShots, ['alvo']),
    homeShotsOnTarget: readMetric(homeBlock, ['no alvo', 'chutes no alvo'], currentForm.homeShotsOnTarget),
    homeXg: readMetric(homeBlock, ['xg', 'expected goals'], currentForm.homeXg),
    odds,
    time: readTimeValue(text, currentForm.time),
  };
}

function range(value, spread, decimals = 0) {
  const start = Math.max(0, value - spread);
  const end = value + spread;

  return `${start.toFixed(decimals)}-${end.toFixed(decimals)}`;
}

function buildProjection(form) {
  const homeXg = toNumber(form.homeXg);
  const awayXg = toNumber(form.awayXg);
  const confidence = Math.round(Math.min(94, Math.max(55, 64 + ((homeXg - awayXg) * 10))));
  const leader = homeXg >= awayXg ? form.homeName : form.awayName;

  return {
    confidence,
    leader,
    rows: [
      { label: 'xG', away: range(toNumber(form.awayXg), 0.28, 2), home: range(toNumber(form.homeXg), 0.28, 2) },
      { label: 'Gols', away: range(toNumber(form.awayXg), 0.45), home: range(toNumber(form.homeXg), 0.45) },
      { label: 'Finalizacoes', away: range(toNumber(form.awayShots), 2), home: range(toNumber(form.homeShots), 2) },
      { label: 'No alvo', away: range(toNumber(form.awayShotsOnTarget), 1), home: range(toNumber(form.homeShotsOnTarget), 1) },
      { label: 'Escanteios', away: range(toNumber(form.awayCorners), 1), home: range(toNumber(form.homeCorners), 1) },
      { label: 'Posse', away: range(toNumber(form.awayPossession), 3), home: range(toNumber(form.homePossession), 3) },
    ],
  };
}

function AdminPage() {
  const [form, setForm] = useState(initialForm);
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

    setForm((current) => parseSmartInput(smartInput, current));
    setSmartStatus('Dados interpretados. Revise a previa antes de publicar a projecao.');
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
                Cole aqui os dados que hoje voce envia no ChatGPT. O sistema interpreta os principais
                campos e monta a previa estatistica automaticamente.
              </p>
            </div>

            <textarea
              onChange={(event) => setSmartInput(event.target.value)}
              placeholder={`Campeonato: Copa do Mundo
Data: 21/07/2026
Horario: 18:30
Odd media: 1.82

Mandante: Colombia
xG: 1.96
Finalizacoes: 15
No alvo: 5
Escanteios: 6.2
Posse: 52

Visitante: Gana
xG: 1.05
Finalizacoes: 11
No alvo: 4
Escanteios: 4.8
Posse: 48`}
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
          <p>{projection.leader} aparece como lado mais forte da projecao inicial.</p>

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
        </aside>
      </section>
    </main>
  );
}

export default AdminPage;
