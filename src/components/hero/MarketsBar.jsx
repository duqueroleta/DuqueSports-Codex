import '../../styles/hero-markets.css';

const markets = [
  { label: 'Over 2.5', value: '78%' },
  { label: 'Ambas marcam', value: '72%' },
  { label: 'Escanteios +8.5', value: '69%' },
  { label: 'Mandante DNB', value: '64%' },
];

function MarketsBar() {
  return (
    <div className="markets-bar" aria-label="Mercados principais">
      {markets.map((market) => (
        <div className="market-chip" key={market.label}>
          <span>{market.label}</span>
          <strong>{market.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default MarketsBar;
