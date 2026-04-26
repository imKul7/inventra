import { useState } from 'react';
import { ScanLine, PackageCheck } from 'lucide-react';
import Topbar from '../components/Topbar';
import StockBadge from '../components/StockBadge';
import { today } from '../utils';

export default function BarcodeScanner({ products, setProducts, transactions, setTransactions, showToast }) {
  const [mode, setMode] = useState('masuk');
  const [code, setCode] = useState('BRG001');
  const [qty, setQty] = useState('1');
  const found = products.find((p) => p.code.toLowerCase() === code.toLowerCase());

  const process = () => {
    const amount = Number(qty);
    if (!found) return showToast('Kode barcode tidak ditemukan.', 'error');
    if (amount <= 0) return showToast('Jumlah harus lebih dari 0.', 'error');
    if (mode === 'keluar' && amount > found.stock) return showToast('Stok tidak mencukupi. Transaksi dibatalkan.', 'error');
    setProducts(products.map((p) => p.id === found.id ? { ...p, stock: mode === 'masuk' ? p.stock + amount : p.stock - amount } : p));
    setTransactions([{ id: Date.now(), type: mode, code: found.code, productName: found.name, qty: amount, date: today(), note: 'Diproses melalui simulasi barcode' }, ...transactions]);
    showToast(`Barcode ${found.code} berhasil diproses.`);
  };

  return (
    <>
      <Topbar title="Simulasi Barcode" subtitle="Masukkan kode barang untuk mensimulasikan proses scan barang masuk atau keluar." />
      <div className="scanner-box">
        <div className="scan-panel">
          <ScanLine size={46} />
          <h2>Barcode Simulation</h2>
          <p>Prototype ini tidak membutuhkan alat scanner fisik. Pengguna cukup memasukkan kode barang seperti BRG001, BRG002, atau BRG003.</p>
          <div className="scan-line" />
          <div className="field"><label style={{ color: '#dbeafe' }}>Mode Transaksi</label><select value={mode} onChange={(e) => setMode(e.target.value)}><option value="masuk">Barang Masuk</option><option value="keluar">Barang Keluar</option></select></div>
          <div className="field"><label style={{ color: '#dbeafe' }}>Kode Barcode</label><input className="input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BRG001" /></div>
          <div className="field"><label style={{ color: '#dbeafe' }}>Jumlah</label><input className="input" type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
          <button className="primary-btn full" onClick={process}><PackageCheck size={18} /> Proses Barcode</button>
        </div>
        <div className="card">
          <div className="card-head"><div><h2>Hasil Scan</h2><p>Sistem memberikan feedback langsung setelah kode dimasukkan.</p></div></div>
          {found ? <div className="product-detail">
            <div className="detail-row"><span>Status</span><StockBadge item={found} /></div>
            <div className="detail-row"><span>Kode</span><strong>{found.code}</strong></div>
            <div className="detail-row"><span>Nama Barang</span><strong>{found.name}</strong></div>
            <div className="detail-row"><span>Kategori</span><strong>{found.category}</strong></div>
            <div className="detail-row"><span>Supplier</span><strong>{found.supplier}</strong></div>
            <div className="detail-row"><span>Stok Saat Ini</span><strong>{found.stock} {found.unit}</strong></div>
            <div className="detail-row"><span>Stok Minimum</span><strong>{found.minStock} {found.unit}</strong></div>
            <div className="alert">Fitur ini menonjolkan prinsip IMK: feedback cepat, efisiensi penggunaan, dan pencegahan kesalahan.</div>
          </div> : <div className="empty">Kode tidak ditemukan. Coba BRG001 sampai BRG010.</div>}
        </div>
      </div>
    </>
  );
}
