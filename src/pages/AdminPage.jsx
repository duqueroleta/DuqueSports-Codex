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
  const projection = useMemo(() => buildProjection(form), [form]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
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
