import './StatCard.css';

export default function StatCard({ label, value, sublabel, accent, icon }) {
  return (
    <div className={`stat-card ${accent ? 'accent' : ''}`}>
      {icon && <div className="stat-icon">{icon}</div>}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sublabel">{sublabel}</div>}
    </div>
  );
}
