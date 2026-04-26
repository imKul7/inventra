import { useMemo, useState } from 'react';
import { Plus, Search, Trash2, Edit3, Save } from 'lucide-react';
import Topbar from '../components/Topbar';
import StockBadge from '../components/StockBadge';
import { categories, suppliers } from '../data/products';
import { formatRupiah, getStockStatus } from '../utils';

const blank = { code: '', name: '', category: 'Sembako', supplier: 'PT Sumber Pangan', buyPrice: '', sellPrice: '', stock: '', minStock: '', unit: 'pcs' };

export default function DataBarang({ products, setProducts, showToast }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [status, setStatus] = useState('Semua');
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);

  const filtered = useMemo(() => products.filter((p) => {
    const matchesQuery = `${p.code} ${p.name}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'Semua' || p.category === category;
    const matchesStatus = status === 'Semua' || getStockStatus(p) === status;
    return matchesQuery && matchesCategory && matchesStatus;
  }), [products, query, category, status]);

  const reset = () => { setForm(blank); setEditingId(null); };

  const save = (e) => {
    e.preventDefault();
    if (!form.code || !form.name || form.stock === '' || form.minStock === '') {
      showToast('Lengkapi kode, nama, stok, dan stok minimum.', 'error');
      return;
    }
    if (editingId) {
      setProducts(products.map((p) => p.id === editingId ? { ...form, id: editingId, buyPrice: Number(form.buyPrice), sellPrice: Number(form.sellPrice), stock: Number(form.stock), minStock: Number(form.minStock) } : p));
      showToast('Data barang berhasil diperbarui.');
    } else {
      const exists = products.some((p) => p.code.toLowerCase() === form.code.toLowerCase());
      if (exists) return showToast('Kode barang sudah digunakan.', 'error');
      setProducts([{ ...form, id: Date.now(), buyPrice: Number(form.buyPrice), sellPrice: Number(form.sellPrice), stock: Number(form.stock), minStock: Number(form.minStock) }, ...products]);
      showToast('Barang baru berhasil ditambahkan.');
    }
    reset();
  };

  const edit = (item) => { setForm(item); setEditingId(item.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = (id) => { setProducts(products.filter((p) => p.id !== id)); showToast('Data barang berhasil dihapus.'); };

  return (
    <>
      <Topbar title="Data Barang" subtitle="Kelola data produk, kategori, supplier, harga, dan status stok barang." />
      <div className="grid two-col">
        <form className="card" onSubmit={save}>
          <div className="card-head"><div><h2>{editingId ? 'Edit Barang' : 'Tambah Barang'}</h2><p>Form dilengkapi validasi untuk mencegah input kosong.</p></div></div>
          <div className="form-grid">
            <div className="field"><label>Kode Barang</label><input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BRG011" /></div>
            <div className="field"><label>Nama Barang</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nama produk" /></div>
            <div className="field"><label>Kategori</label><select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{categories.filter((c) => c !== 'Semua').map((c) => <option key={c}>{c}</option>)}</select></div>
            <div className="field"><label>Supplier</label><select value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>{suppliers.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="field"><label>Harga Beli</label><input className="input" type="number" value={form.buyPrice} onChange={(e) => setForm({ ...form, buyPrice: e.target.value })} /></div>
            <div className="field"><label>Harga Jual</label><input className="input" type="number" value={form.sellPrice} onChange={(e) => setForm({ ...form, sellPrice: e.target.value })} /></div>
            <div className="field"><label>Stok</label><input className="input" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
            <div className="field"><label>Stok Minimum</label><input className="input" type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button className="primary-btn" type="submit"><Save size={18} /> Simpan Data</button><button className="ghost-btn" type="button" onClick={reset}>Reset</button></div>
        </form>

        <div className="card">
          <div className="card-head"><div><h2>Ringkasan IMK</h2><p>Desain data barang dibuat agar pengguna tidak perlu mengingat semua kode barang.</p></div></div>
          <div className="alert">Fitur search, filter kategori, filter status, badge warna, serta tombol aksi membantu prinsip <strong>recognition rather than recall</strong> dan <strong>consistency</strong>.</div>
          <button className="primary-btn full" onClick={() => setForm({ ...blank, code: `BRG${String(products.length + 1).padStart(3, '0')}` })}><Plus size={18} /> Buat Kode Otomatis</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search"><input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari kode atau nama barang..." /></div>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>{['Semua', 'Aman', 'Menipis', 'Habis'].map((s) => <option key={s}>{s}</option>)}</select>
          </div>
          <button className="ghost-btn"><Search size={18} /> {filtered.length} hasil</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Kode</th><th>Nama</th><th>Kategori</th><th>Supplier</th><th>Harga Jual</th><th>Stok</th><th>Status</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((p) => <tr key={p.id}><td>{p.code}</td><td>{p.name}</td><td>{p.category}</td><td>{p.supplier}</td><td>{formatRupiah(p.sellPrice)}</td><td>{p.stock} {p.unit}</td><td><StockBadge item={p} /></td><td><button className="ghost-btn" onClick={() => edit(p)}><Edit3 size={15} /></button> <button className="danger-btn" onClick={() => remove(p.id)}><Trash2 size={15} /></button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
