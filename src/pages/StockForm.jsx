import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";

import Topbar from "../components/Topbar";
import StockMovementService from "../services/stockMovementService";
import { today } from "../utils";

export default function StockForm({
  type,
  products = [],
  transactions,
  setTransactions,
  showToast,
  loadProducts,
}) {
  const isIncoming = type === "masuk";

  const [productId, setProductId] = useState("");
  const [qty, setQty] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (products.length > 0 && !productId) {
      setProductId(products[0].id);
    }
  }, [products, productId]);

  const selected = useMemo(() => {
    return products.find((p) => Number(p.id) === Number(productId));
  }, [products, productId]);

  async function loadHistory() {
    try {
      const data = await StockMovementService.getAll();

      const formatted = data.map((item) => ({
        id: item.id,
        type: item.type,
        code: item.product?.kode_barang || "-",
        productName: item.product?.nama_barang || "-",
        qty: item.jumlah,
        date: item.tanggal ? String(item.tanggal).slice(0, 10) : "-",
        note: item.keterangan || "-",
      }));

      setHistory(formatted);

      if (setTransactions) {
        setTransactions(formatted);
      }
    } catch (error) {
      console.error("Gagal load riwayat stok:", error);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function submit(e) {
    e.preventDefault();

    const amount = Number(qty);

    if (!selected || amount <= 0) {
      showToast("Pilih barang dan masukkan jumlah yang valid.", "error");
      return;
    }

    if (!isIncoming && amount > Number(selected.stock)) {
      showToast(
        "Stok tidak mencukupi. Silakan periksa jumlah barang keluar.",
        "error"
      );
      return;
    }

    const payload = {
      product_id: Number(selected.id),
      type,
      jumlah: amount,
      keterangan:
        note ||
        (isIncoming
          ? "Barang masuk"
          : "Barang keluar"),
    };

    try {
      setLoading(true);

      await StockMovementService.create(payload);

      showToast(
        isIncoming
          ? "Barang masuk berhasil dicatat dan stok bertambah."
          : "Barang keluar berhasil dicatat dan stok berkurang."
      );

      setQty("");
      setNote("");
      setDate(today());

      await loadProducts();
      await loadHistory();
    } catch (error) {
      console.error("Gagal menyimpan transaksi:", error);

      const message =
        error.response?.data?.message ||
        "Gagal menyimpan transaksi stok.";

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const filteredHistory = history.filter((t) => t.type === type);

  const stockAfterProcess = selected
    ? qty
      ? isIncoming
        ? Number(selected.stock) + Number(qty)
        : Number(selected.stock) - Number(qty)
      : Number(selected.stock)
    : 0;

  return (
    <>
      <Topbar
        title={isIncoming ? "Barang Masuk" : "Barang Keluar"}
        subtitle={
          isIncoming
            ? "Catat penambahan stok dari supplier atau pembelian."
            : "Catat pengurangan stok akibat penjualan atau distribusi."
        }
      />

      <div className="grid two-col">
        <form className="card" onSubmit={submit}>
          <div className="card-head">
            <div>
              <h2>
                {isIncoming
                  ? "Form Barang Masuk"
                  : "Form Barang Keluar"}
              </h2>
              <p>
                Sistem otomatis memperbarui stok di database setelah
                transaksi disimpan.
              </p>
            </div>
          </div>

          <div className="field">
            <label>Pilih Barang</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              {products.length > 0 ? (
                products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} - {p.name}
                  </option>
                ))
              ) : (
                <option value="">Tidak ada barang</option>
              )}
            </select>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Jumlah</label>
              <input
                className="input"
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="field">
              <label>Tanggal</label>
              <input
                className="input"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Catatan</label>
            <textarea
              className="input"
              rows="4"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={
                isIncoming
                  ? "Contoh: Pembelian dari supplier"
                  : "Contoh: Penjualan harian"
              }
            />
          </div>

          <button
            className={isIncoming ? "success-btn" : "primary-btn"}
            type="submit"
            disabled={loading}
          >
            <Save size={18} />
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Preview Barang</h2>
              <p>Feedback visual sebelum transaksi diproses.</p>
            </div>
          </div>

          {selected ? (
            <div className="product-detail">
              <div className="detail-row">
                <span>Kode</span>
                <strong>{selected.code}</strong>
              </div>

              <div className="detail-row">
                <span>Nama</span>
                <strong>{selected.name}</strong>
              </div>

              <div className="detail-row">
                <span>Kategori</span>
                <strong>{selected.category}</strong>
              </div>

              <div className="detail-row">
                <span>Stok Saat Ini</span>
                <strong>
                  {selected.stock} {selected.unit}
                </strong>
              </div>

              <div className="detail-row">
                <span>Stok Setelah Proses</span>
                <strong>
                  {stockAfterProcess} {selected.unit}
                </strong>
              </div>

              {!isIncoming &&
                qty &&
                Number(qty) > Number(selected.stock) && (
                  <div
                    className="alert"
                    style={{
                      background: "#fee2e2",
                      color: "#991b1b",
                    }}
                  >
                    Error prevention: jumlah keluar melebihi stok tersedia.
                  </div>
                )}
            </div>
          ) : (
            <div className="empty">Barang tidak ditemukan.</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <h2>Riwayat Transaksi</h2>
            <p>
              Menampilkan transaksi terbaru dari tabel stock_movements.
            </p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Tipe</th>
                <th>Kode</th>
                <th>Barang</th>
                <th>Jumlah</th>
                <th>Catatan</th>
              </tr>
            </thead>

            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>
                      <span className={`badge ${t.type}`}>
                        {t.type}
                      </span>
                    </td>
                    <td>{t.code}</td>
                    <td>{t.productName}</td>
                    <td>{t.qty}</td>
                    <td>{t.note}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">
                    Belum ada transaksi{" "}
                    {isIncoming ? "barang masuk" : "barang keluar"}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}