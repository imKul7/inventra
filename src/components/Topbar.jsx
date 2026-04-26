export default function Topbar({ title, subtitle }) {
  return (
    <header className="topbar">
      <div className="page-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="user-chip">
        <div className="avatar">A</div>
        <div>
          <strong>Admin Gudang</strong><br />
          <span style={{ color: '#64748b', fontSize: 12 }}>Kelompok 2 - IMK</span>
        </div>
      </div>
    </header>
  );
}
