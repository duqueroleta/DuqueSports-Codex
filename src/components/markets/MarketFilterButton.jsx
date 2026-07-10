import '../../styles/market-filter-control.css';

function MarketFilterButton({ isActive, label, onSelect }) {
  return (
    <button
      aria-pressed={isActive}
      className={`market-filter-control ${isActive ? 'markets-filter-active' : ''}`}
      onClick={onSelect}
      type="button"
    >
      {label}
    </button>
  );
}

export default MarketFilterButton;
