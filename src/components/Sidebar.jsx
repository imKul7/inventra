import { Boxes, LayoutDashboard, Package, PackagePlus, PackageMinus, ScanLine, RefreshCcw, FileText, LogOut } from 'lucide-react';

const menu = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'products', label: 'Data Barang', icon: Package },
  { key: 'incoming', label: 'Barang Masuk', icon: PackagePlus },
  { key: 'outgoing', label: 'Barang Keluar', icon: PackageMinus },
  { key: 'barcode', label: 'Simulasi Barcode', icon: ScanLine },
  { key: 'restock', label: 'Rekomendasi Restock', icon: RefreshCcw },
  { key: 'reports', label: 'Laporan', icon: FileText }
];

export default function Sidebar({ activePage, setActivePage, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon"><Boxes size={24} /></div>
        <div>
          <h2>Inventra</h2>
          <span>Smart Inventory System</span>
        </div>
      </div>

      <nav className="nav">
        {menu.map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} className={activePage === item.key ? 'active' : ''} onClick={() => setActivePage(item.key)}>
              <Icon size={18} /> {item.label}
            </button>
          );
        })}
        <button onClick={onLogout}><LogOut size={18} /> Keluar</button>
      </nav>

      <div className="sidebar-footer">
        <strong>Prinsip IMK:</strong><br />
        Feedback jelas, navigasi konsisten, validasi error, dan informasi stok mudah dikenali.
      </div>
    </aside>
  );
}
