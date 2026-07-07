import '../../styles/skeleton.css';

function SkeletonGrid({ count = 6, variant = 'card' }) {
  return Array.from({ length: count }, (_, index) => (
    <div className={`skeleton-card skeleton-card-${variant}`} key={index}>
      <span />
      <strong />
      <p />
      <p />
    </div>
  ));
}

export default SkeletonGrid;
