export default function StatCard({ title, value, icon: Icon, note }) {
  return (
    <div className="card stat-card">
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
        {note && <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 13 }}>{note}</p>}
      </div>
      <div className="icon-box">{Icon && <Icon size={23} />}</div>
    </div>
  );
}
