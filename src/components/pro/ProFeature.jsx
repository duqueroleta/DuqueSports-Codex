import '../../styles/pro-feature.css';

function ProFeature({ label }) {
  return (
    <div className="pro-feature">
      <span aria-hidden="true" />
      <strong>{label}</strong>
    </div>
  );
}

export default ProFeature;
