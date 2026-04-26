import { RefreshCcw, AlertTriangle } from 'lucide-react';
import Topbar from '../components/Topbar';
import StockBadge from '../components/StockBadge';
import { getStockStatus, getRestockSuggestion } from '../utils';

export default function Restock({ products, setActivePage }) {
  const items = products.filter((p) => getStockStatus(p) !== 'Aman').sort((a, b) => a.stock - b.stock);
  return (
    <>
      <Topbar title="Rekomendasi Restock" subtitle="Daftar barang yang stoknya berada di bawah batas minimum dan perlu segera ditambah." />
      <div className="alert"><AlertTriangle size={18} style={{ verticalAlign: 'middle' }} /> Sistem menghitung rekomendasi berdasarkan stok minimum. Barang habis menjadi prioritas tertinggi.</div>
      <div className="card">
        <div className="card-head">
          <div><h2>Barang Perlu Restock</h2><p>Prioritaskan barang dengan status Habis dan Menipis.</p></div>
          <button className="primary-btn" onClick={() => setActivePage('incoming')}><RefreshCcw size={18} /> Restock Sekarang</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kode</th><th>Nama Barang</th><th>Kategori</th><th>Stok</th><th>Minimum</th><th>Status</th><th>Rekomendasi</th></tr></thead>
            <tbody>
              {items.map((p) => <tr key={p.id}><td>{p.code}</td><td>{p.name}</td><td>{p.category}</td><td>{p.stock} {p.unit}</td><td>{p.minStock} {p.unit}</td><td><StockBadge item={p} /></td><td><strong>Restock {getRestockSuggestion(p)} {p.unit}</strong></td></tr>)}
              {!items.length && <tr><td colSpan="7"><div className="empty">Semua stok dalam kondisi aman.</div></td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
