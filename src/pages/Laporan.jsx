import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  FileText,
  Printer,
  Download,
  TrendingDown,
  RefreshCw,
} from "lucide-react";

import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import StockBadge from "../components/StockBadge";
import StockMovementService from "../services/stockMovementService";

import { getStockStatus, formatRupiah } from "../utils";

export default function Laporan({ products = [], showToast }) {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  async function loadMovements() {
    try {
      setLoading(true);

      const data = await StockMovementService.getAll();

      const formatted = data.map((item) => ({
        id: item.id,
        date: item.tanggal,
        type: item.type,
        code: item.product?.kode_barang || "-",
        productName: item.product?.nama_barang || "-",
        qty: Number(item.jumlah || 0),
        note: item.keterangan || "-",
        user: item.user?.name || "-",
      }));

      setMovements(formatted);
    } catch (error) {
      console.error("Gagal mengambil laporan transaksi:", error);

      if (showToast) {
        showToast("Gagal mengambil data laporan transaksi.", "error");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMovements();
  }, []);

  function formatDate(value) {
    if (!value) return "-";

    const safeValue = String(value).replace(" ", "T");
    const date = new Date(safeValue);

    if (Number.isNaN(date.getTime())) {
      return String(value).slice(0, 10);
    }

    return date.toLocaleDateString("id-ID");
  }

  const value = useMemo(() => {
    return products.reduce((sum, p) => {
      const price = Number(p.buyPrice || p.sellPrice || 0);
      const stock = Number(p.stock || 0);

      return sum + stock * price;
    }, 0);
  }, [products]);

  const incoming = useMemo(() => {
    return movements
      .filter((t) => t.type === "masuk")
      .reduce((sum, t) => sum + Number(t.qty || 0), 0);
  }, [movements]);

  const outgoing = useMemo(() => {
    return movements
      .filter((t) => t.type === "keluar")
      .reduce((sum, t) => sum + Number(t.qty || 0), 0);
  }, [movements]);

  const critical = useMemo(() => {
    return products.filter((p) => getStockStatus(p) !== "Aman");
  }, [products]);

  function handleExportPDF() {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Laporan Persediaan Barang - Inventra", 14, 20);

    doc.setFontSize(11);
    doc.text(
      `Tanggal Export: ${new Date().toLocaleDateString("id-ID")}`,
      14,
      28
    );

    doc.text(`Nilai Persediaan: ${formatRupiah(value)}`, 14, 36);
    doc.text(`Total Barang Masuk: ${incoming}`, 14, 43);
    doc.text(`Total Barang Keluar: ${outgoing}`, 14, 50);
    doc.text(`Jumlah Stok Kritis: ${critical.length}`, 14, 57);

    autoTable(doc, {
      startY: 66,
      head: [
        [
          "Kode",
          "Nama Barang",
          "Kategori",
          "Supplier",
          "Stok",
          "Minimum",
          "Harga",
          "Status",
        ],
      ],
      body: products.map((product) => [
        product.code,
        product.name,
        product.category,
        product.supplier,
        `${product.stock} ${product.unit || ""}`,
        `${product.minStock} ${product.unit || ""}`,
        formatRupiah(product.sellPrice),
        getStockStatus(product),
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
      },
    });

    let finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Riwayat Transaksi Stok", 14, finalY);

    autoTable(doc, {
      startY: finalY + 6,
      head: [["Tanggal", "Tipe", "Kode", "Barang", "Jumlah", "Catatan"]],
      body: movements.map((item) => [
        formatDate(item.date),
        item.type,
        item.code,
        item.productName,
        item.qty,
        item.note,
      ]),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [22, 163, 74],
        textColor: 255,
      },
    });

    finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(14);
    doc.text("Daftar Stok Kritis", 14, finalY);

    if (critical.length > 0) {
      autoTable(doc, {
        startY: finalY + 6,
        head: [["Kode", "Nama Barang", "Stok", "Minimum", "Status"]],
        body: critical.map((product) => [
          product.code,
          product.name,
          `${product.stock} ${product.unit || ""}`,
          `${product.minStock} ${product.unit || ""}`,
          getStockStatus(product),
        ]),
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [239, 68, 68],
          textColor: 255,
        },
      });
    } else {
      doc.setFontSize(10);
      doc.text("Tidak ada stok kritis.", 14, finalY + 8);
    }

    doc.save("laporan-inventra.pdf");

    if (showToast) {
      showToast("Laporan PDF berhasil diunduh.");
    }
  }

  function handleExportExcel() {
    const stockData = products.map((product) => ({
      Kode: product.code,
      "Nama Barang": product.name,
      Kategori: product.category,
      Supplier: product.supplier,
      Stok: product.stock,
      Satuan: product.unit || "",
      "Stok Minimum": product.minStock,
      Harga: product.sellPrice,
      Status: getStockStatus(product),
      "Nilai Persediaan":
        Number(product.stock || 0) *
        Number(product.buyPrice || product.sellPrice || 0),
    }));

    const transactionData = movements.map((item) => ({
      Tanggal: formatDate(item.date),
      Tipe: item.type,
      Kode: item.code,
      Barang: item.productName,
      Jumlah: item.qty,
      Catatan: item.note,
      User: item.user,
    }));

    const criticalData = critical.map((product) => ({
      Kode: product.code,
      "Nama Barang": product.name,
      Stok: product.stock,
      Satuan: product.unit || "",
      "Stok Minimum": product.minStock,
      Status: getStockStatus(product),
    }));

    const summaryData = [
      {
        Keterangan: "Nilai Persediaan",
        Nilai: value,
      },
      {
        Keterangan: "Total Barang Masuk",
        Nilai: incoming,
      },
      {
        Keterangan: "Total Barang Keluar",
        Nilai: outgoing,
      },
      {
        Keterangan: "Jumlah Stok Kritis",
        Nilai: critical.length,
      },
      {
        Keterangan: "Tanggal Export",
        Nilai: new Date().toLocaleDateString("id-ID"),
      },
    ];

    const workbook = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    const stockSheet = XLSX.utils.json_to_sheet(stockData);
    const transactionSheet = XLSX.utils.json_to_sheet(transactionData);
    const criticalSheet = XLSX.utils.json_to_sheet(criticalData);

    XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");
    XLSX.utils.book_append_sheet(workbook, stockSheet, "Stok Barang");
    XLSX.utils.book_append_sheet(workbook, transactionSheet, "Transaksi");
    XLSX.utils.book_append_sheet(workbook, criticalSheet, "Stok Kritis");

    XLSX.writeFile(workbook, "laporan-inventra.xlsx");

    if (showToast) {
      showToast("Laporan Excel berhasil diunduh.");
    }
  }

  return (
    <>
      <Topbar
        title="Laporan Persediaan"
        subtitle="Ringkasan stok, transaksi, nilai persediaan, dan barang prioritas berdasarkan database."
      />

      <div className="grid report-grid">
        <StatCard
          title="Nilai Persediaan"
          value={formatRupiah(value)}
          icon={FileText}
          note="Berdasarkan nilai barang"
        />

        <StatCard
          title="Total Barang Masuk"
          value={loading ? "..." : incoming}
          icon={Download}
          note="Dari tabel stock_movements"
        />

        <StatCard
          title="Total Barang Keluar"
          value={loading ? "..." : outgoing}
          icon={TrendingDown}
          note="Dari tabel stock_movements"
        />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <h2>Aksi Laporan</h2>
            <p>Cetak laporan atau export data persediaan barang.</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="ghost-btn" onClick={loadMovements}>
              <RefreshCw size={18} />
              Refresh
            </button>

            <button className="ghost-btn" onClick={() => window.print()}>
              <Printer size={18} />
              Cetak
            </button>

            <button className="primary-btn" onClick={handleExportPDF}>
              <Download size={18} />
              Export PDF
            </button>

            <button className="success-btn" onClick={handleExportExcel}>
              <Download size={18} />
              Export Excel
            </button>
          </div>
        </div>

        <div className="print-note">
          Laporan mengambil data langsung dari database MySQL melalui Laravel
          API. Export PDF dan Excel sudah aktif.
        </div>
      </div>

      <div className="grid two-col" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Laporan Stok Barang</h2>
              <p>Data stok seluruh barang aktif.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Barang</th>
                  <th>Kategori</th>
                  <th>Supplier</th>
                  <th>Stok</th>
                  <th>Minimum</th>
                  <th>Harga</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.length > 0 ? (
                  products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.supplier}</td>
                      <td>
                        {p.stock} {p.unit}
                      </td>
                      <td>
                        {p.minStock} {p.unit}
                      </td>
                      <td>{formatRupiah(p.sellPrice)}</td>
                      <td>
                        <StockBadge item={p} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">Belum ada data barang.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Stok Kritis</h2>
              <p>Barang yang perlu perhatian khusus.</p>
            </div>
          </div>

          {critical.length > 0 ? (
            critical.map((p) => (
              <div className="detail-row" key={p.id}>
                <span>{p.name}</span>
                <strong>
                  {p.stock} {p.unit}
                </strong>
              </div>
            ))
          ) : (
            <div className="empty">Tidak ada stok kritis.</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <h2>Riwayat Transaksi Stok</h2>
            <p>Data transaksi barang masuk dan keluar dari database.</p>
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
                <th>User</th>
              </tr>
            </thead>

            <tbody>
              {movements.length > 0 ? (
                movements.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDate(item.date)}</td>
                    <td>
                      <span className={`badge ${item.type}`}>
                        {item.type}
                      </span>
                    </td>
                    <td>{item.code}</td>
                    <td>{item.productName}</td>
                    <td>{item.qty}</td>
                    <td>{item.note}</td>
                    <td>{item.user}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    Belum ada transaksi stok di database.
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