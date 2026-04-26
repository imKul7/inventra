import { useState } from 'react';
import { PackageMinus, PackagePlus, Save } from 'lucide-react';
import Topbar from '../components/Topbar';
import { today } from '../utils';

export default function StockForm({ type, products, setProducts, transactions, setTransactions, showToast }) {
  const isIncoming = type === 'masuk';
  const [code, setCode] = useState(products[0]?.code || '');
  const [qty, setQty] = useState('');
  const [date, setDate] = useState(today());
  const [note, setNote] = useState('');
  const selected = products.find((p) => p.code === code);

  const submit = (e) => {
    e.preventDefault();
    const amount = Number(qty);
    if (!selected || amount <= 0) return showToast('Pilih barang dan masukkan jumlah yang valid.', 'error');
    if (!isIncoming && amount > selected.stock) return showToast('Stok tidak mencukupi. Silakan periksa jumlah barang keluar.', 'error');

    setProducts(products.map((p) => p.id === selected.id ? { ...p, stock: isIncoming ? p.stock + amount : p.stock - amount } : p));
    setTransactions([{ id: Date.now(), type, code: selected.code, productName: selected.name, qty: amount, date, note: note || (isIncoming ? 'Barang masuk' : 'Barang keluar') }, ...transactions]);
    showToast(isIncoming ? 'Barang masuk berhasil dicatat dan stok bertambah.' : 'Barang keluar berhasil dicatat dan stok berkurang.');
    setQty(''); setNote('');
  };

  return (
    <>
      <Topbar title={isIncoming ? 'Barang Masuk' : 'Barang Keluar'} subtitle={isIncoming ? 'Catat penambahan stok dari supplier atau pembelian.' : 'Catat pengurangan stok akibat penjualan atau distribusi.'} />
      <div className="grid two-col">
        <form className="card" onSubmit={submit}>
          <div className="card-head"><div><h2>{isIncoming ? 'Form Barang Masuk' : 'Form Barang Keluar'}</h2><p>Sistem otomatis memperbarui stok setelah transaksi disimpan.</p></div></div>
          <div className="field"><label>Pilih Barang</label><select value={code} onChange={(e) => setCode(e.target.value)}>{products.map((p) => <option key={p.id} value={p.code}>{p.code} - {p.name}</option>)}</select></div>
          <div className="form-grid">
            <div className="field"><label>Jumlah</label><input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" /></div>
            <div className="field"><label>Tanggal</label><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          </div>
          <div className="field"><label>Catatan</label><textarea rows="4" value={note} onChange={(e) => setNote(e.target.value)} placeholder={isIncoming ? 'Contoh: Pembelian dari supplier' : 'Contoh: Penjualan harian'} /></div>
          <button className={isIncoming ? 'success-btn' : 'primary-btn'} type="submit"><Save size={18} /> Simpan Transaksi</button>
        </form>
        <div className="card">
          <div className="card-head"><div><h2>Preview Barang</h2><p>Feedback visual sebelum transaksi diproses.</p></div></div>
          {selected ? <div className="product-detail">
            <div className="detail-row"><span>Kode</span><strong>{selected.code}</strong></div>
            <div className="detail-row"><span>Nama</span><strong>{selected.name}</strong></div>
            <div className="detail-row"><span>Kategori</span><strong>{selected.category}</strong></div>
            <div className="detail-row"><span>Stok Saat Ini</span><strong>{selected.stock} {selected.unit}</strong></div>
            <div className="detail-row"><span>Stok Setelah Proses</span><strong>{qty ? (isIncoming ? selected.stock + Number(qty) : selected.stock - Number(qty)) : selected.stock} {selected.unit}</strong></div>
            {!isIncoming && qty && Number(qty) > selected.stock && <div className="alert" style={{ background: '#fee2e2', color: '#991b1b' }}>Error prevention: jumlah keluar melebihi stok tersedia.</div>}
          </div> : <div className="empty">Barang tidak ditemukan.</div>}
        </div>
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head"><div><h2>Riwayat Transaksi</h2><p>Menampilkan transaksi terbaru untuk membantu pelacakan stok.</p></div></div>
        <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Tipe</th><th>Kode</th><th>Barang</th><th>Jumlah</th><th>Catatan</th></tr></thead><tbody>{transactions.filter((t) => t.type === type).map((t) => <tr key={t.id}><td>{t.date}</td><td><span className={`badge ${t.type}`}>{t.type}</span></td><td>{t.code}</td><td>{t.productName}</td><td>{t.qty}</td><td>{t.note}</td></tr>)}</tbody></table></div>
      </div>
    </>
  );
}
