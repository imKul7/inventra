import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Boxes, AlertTriangle, Ban, Layers, TrendingUp } from 'lucide-react';
import Topbar from '../components/Topbar';
import StatCard from '../components/StatCard';
import StockBadge from '../components/StockBadge';
import { getStockStatus } from '../utils';

export default function Dashboard({ products, transactions, setActivePage }) {
  const low = products.filter((p) => getStockStatus(p) === 'Menipis').length;
  const empty = products.filter((p) => getStockStatus(p) === 'Habis').length;
  const categories = new Set(products.map((p) => p.category)).size;
  const criticalProducts = products.filter((p) => getStockStatus(p) !== 'Aman').slice(0, 6);
  const chartData = products.slice(0, 7).map((p) => ({ name: p.code, stok: p.stock, minimum: p.minStock }));
  const pieData = ['Aman', 'Menipis', 'Habis'].map((s) => ({ name: s, value: products.filter((p) => getStockStatus(p) === s).length }));

  return (
    <>
      <Topbar title="Dashboard Persediaan" subtitle="Pantau stok barang, aktivitas gudang, dan rekomendasi restock dalam satu halaman." />
      <div className="grid stats">
        <StatCard title="Total Barang" value={products.length} icon={Boxes} note="Seluruh item aktif" />
        <StatCard title="Total Kategori" value={categories} icon={Layers} note="Kategori barang" />
        <StatCard title="Stok Menipis" value={low} icon={AlertTriangle} note="Perlu dipantau" />
        <StatCard title="Stok Habis" value={empty} icon={Ban} note="Prioritas restock" />
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-head">
            <div><h2>Grafik Stok vs Minimum</h2><p>Perbandingan stok saat ini dengan batas minimum.</p></div>
          </div>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stok" />
                <Bar dataKey="minimum" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div><h2>Status Stok</h2><p>Distribusi kondisi barang.</p></div>
          </div>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                  {pieData.map((_, index) => <Cell key={index} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <button className="ghost-btn full" onClick={() => setActivePage('restock')}><TrendingUp size={18} /> Lihat Rekomendasi Restock</button>
        </div>
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-head"><div><h2>Barang Prioritas</h2><p>Barang yang harus segera diperhatikan.</p></div></div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kode</th><th>Nama Barang</th><th>Stok</th><th>Status</th></tr></thead>
              <tbody>
                {criticalProducts.map((p) => <tr key={p.id}><td>{p.code}</td><td>{p.name}</td><td>{p.stock} {p.unit}</td><td><StockBadge item={p} /></td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head"><div><h2>Aktivitas Terbaru</h2><p>Riwayat transaksi stok.</p></div></div>
          {transactions.slice(0, 5).map((t) => (
            <div className="detail-row" key={t.id}>
              <span><span className={`badge ${t.type}`}>{t.type}</span> {t.productName}</span>
              <strong>{t.qty}</strong>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
