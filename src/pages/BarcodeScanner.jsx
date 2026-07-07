import { useEffect, useMemo, useState } from "react";
import { ScanLine, PackageCheck, RefreshCw } from "lucide-react";

import Topbar from "../components/Topbar";
import StockBadge from "../components/StockBadge";
import StockMovementService from "../services/stockMovementService";

export default function BarcodeScanner({
  products = [],
  showToast,
  loadProducts,
}) {
  const [mode, setMode] = useState("masuk");
  const [code, setCode] = useState("");
  const [qty, setQty] = useState("1");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !code) {
      setCode(products[0].barcode || products[0].code || "");
    }
  }, [products, code]);

  const found = useMemo(() => {
    const keyword = code.toLowerCase();

    return products.find((p) => {
      const productCode = String(p.code || "").toLowerCase();
      const productBarcode = String(p.barcode || "").toLowerCase();

      return productCode === keyword || productBarcode === keyword;
    });
  }, [products, code]);

  async function process() {
    const amount = Number(qty);

    if (!code) {
      showToast("Masukkan kode barang atau barcode.", "error");
      return;
    }

    if (!found) {
      showToast("Kode barang atau barcode tidak ditemukan.", "error");
      return;
    }

    if (amount <= 0) {
      showToast("Jumlah harus lebih dari 0.", "error");
      return;
    }

    if (mode === "keluar" && amount > Number(found.stock)) {
      showToast("Stok tidak mencukupi. Transaksi dibatalkan.", "error");
      return;
    }

    const payload = {
      product_id: Number(found.id),
      type: mode,
      jumlah: amount,
      keterangan: "Diproses melalui simulasi barcode",
    };

    try {
      setLoading(true);

      await StockMovementService.create(payload);

      showToast(
        mode === "masuk"
          ? `Barcode ${found.code} berhasil diproses. Stok bertambah.`
          : `Barcode ${found.code} berhasil diproses. Stok berkurang.`
      );

      setQty("1");

      if (loadProducts) {
        await loadProducts();
      }
    } catch (error) {
      console.error("Gagal proses barcode:", error);

      const message =
        error.response?.data?.message ||
        "Gagal memproses barcode.";

      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const stockAfterProcess = found
    ? mode === "masuk"
      ? Number(found.stock) + Number(qty || 0)
      : Number(found.stock) - Number(qty || 0)
    : 0;

  return (
    <>
      <Topbar
        title="Simulasi Barcode"
        subtitle="Masukkan kode barang atau barcode untuk mensimulasikan proses barang masuk dan keluar."
      />

      <div className="scanner-box">
        <div className="scan-panel">
          <ScanLine size={46} />

          <h2>Barcode Simulation</h2>

          <p>
            Prototype ini tidak membutuhkan alat scanner fisik. Pengguna dapat
            memasukkan kode barang seperti BRG001 atau barcode seperti
            8990000000001.
          </p>

          <div className="scan-line" />

          <div className="field">
            <label style={{ color: "#dbeafe" }}>Mode Transaksi</label>

            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
            >
              <option value="masuk">Barang Masuk</option>
              <option value="keluar">Barang Keluar</option>
            </select>
          </div>

          <div className="field">
            <label style={{ color: "#dbeafe" }}>
              Kode Barang / Barcode
            </label>

            <input
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="BRG001 atau 8990000000001"
            />
          </div>

          <div className="field">
            <label style={{ color: "#dbeafe" }}>Jumlah</label>

            <input
              className="input"
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />
          </div>

          <button
            className="primary-btn full"
            onClick={process}
            disabled={loading}
          >
            <PackageCheck size={18} />
            {loading ? "Memproses..." : "Proses Barcode"}
          </button>

          <button
            className="ghost-btn full"
            type="button"
            onClick={loadProducts}
            style={{ marginTop: 10 }}
          >
            <RefreshCw size={18} />
            Refresh Data
          </button>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Hasil Scan</h2>
              <p>
                Sistem memberikan feedback langsung setelah kode barang atau
                barcode dimasukkan.
              </p>
            </div>
          </div>

          {found ? (
            <div className="product-detail">
              <div className="detail-row">
                <span>Status</span>
                <StockBadge item={found} />
              </div>

              <div className="detail-row">
                <span>Kode</span>
                <strong>{found.code}</strong>
              </div>

              <div className="detail-row">
                <span>Barcode</span>
                <strong>{found.barcode || "-"}</strong>
              </div>

              <div className="detail-row">
                <span>Nama Barang</span>
                <strong>{found.name}</strong>
              </div>

              <div className="detail-row">
                <span>Kategori</span>
                <strong>{found.category}</strong>
              </div>

              <div className="detail-row">
                <span>Supplier</span>
                <strong>{found.supplier}</strong>
              </div>

              <div className="detail-row">
                <span>Stok Saat Ini</span>
                <strong>
                  {found.stock} {found.unit}
                </strong>
              </div>

              <div className="detail-row">
                <span>Stok Minimum</span>
                <strong>
                  {found.minStock} {found.unit}
                </strong>
              </div>

              <div className="detail-row">
                <span>Stok Setelah Proses</span>
                <strong>
                  {stockAfterProcess} {found.unit}
                </strong>
              </div>

              {mode === "keluar" &&
                qty &&
                Number(qty) > Number(found.stock) && (
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

              <div className="alert">
                Fitur ini menonjolkan prinsip IMK: feedback cepat, efisiensi
                penggunaan, dan pencegahan kesalahan.
              </div>
            </div>
          ) : (
            <div className="empty">
              Kode barang atau barcode tidak ditemukan.
            </div>
          )}
        </div>
      </div>
    </>
  );
}