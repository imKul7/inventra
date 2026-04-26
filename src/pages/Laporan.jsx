import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { FileText, Printer, Download, TrendingDown } from "lucide-react";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import StockBadge from "../components/StockBadge";
import { getStockStatus, formatRupiah } from "../utils";

export default function Laporan({ products, transactions, showToast }) {
  const value = products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0);

  const incoming = transactions
    .filter((t) => t.type === "masuk")
    .reduce((s, t) => s + t.qty, 0);

  const outgoing = transactions
    .filter((t) => t.type === "keluar")
    .reduce((s, t) => s + t.qty, 0);

  const critical = products.filter((p) => getStockStatus(p) !== "Aman");

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

    autoTable(doc, {
      startY: 60,
      head: [
        [
          "Kode",
          "Nama Barang",
          "Kategori",
          "Supplier",
          "Stok",
          "Minimum",
          "Harga Beli",
          "Harga Jual",
          "Status",
        ],
      ],
      body: products.map((product) => {
        const status = getStockStatus(product);

        return [
          product.code,
          product.name,
          product.category,
          product.supplier,
          `${product.stock} ${product.unit || ""}`,
          `${product.minStock} ${product.unit || ""}`,
          formatRupiah(product.buyPrice),
          formatRupiah(product.sellPrice),
          status,
        ];
      }),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
      },
    });

    const finalY = doc.lastAutoTable.finalY + 10;

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

  const dummy = (text) =>
    showToast(
      `${text} berhasil disimulasikan. Pada versi final dapat dihubungkan ke fitur export sebenarnya.`
    );

function handleExportExcel() {
  const stockData = products.map((product) => ({
    Kode: product.code,
    "Nama Barang": product.name,
    Kategori: product.category,
    Supplier: product.supplier,
    Stok: product.stock,
    Satuan: product.unit || "",
    "Stok Minimum": product.minStock,
    "Harga Beli": product.buyPrice,
    "Harga Jual": product.sellPrice,
    Status: getStockStatus(product),
    "Nilai Persediaan": product.stock * product.buyPrice,
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
    { Keterangan: "Nilai Persediaan", Nilai: value },
    { Keterangan: "Total Barang Masuk", Nilai: incoming },
    { Keterangan: "Total Barang Keluar", Nilai: outgoing },
    { Keterangan: "Jumlah Stok Kritis", Nilai: critical.length },
    {
      Keterangan: "Tanggal Export",
      Nilai: new Date().toLocaleDateString("id-ID"),
    },
  ];

  const workbook = XLSX.utils.book_new();

  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  const stockSheet = XLSX.utils.json_to_sheet(stockData);
  const criticalSheet = XLSX.utils.json_to_sheet(criticalData);

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan");
  XLSX.utils.book_append_sheet(workbook, stockSheet, "Stok Barang");
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
        subtitle="Ringkasan stok, transaksi, nilai persediaan, dan barang prioritas."
      />

      <div className="grid report-grid">
        <StatCard
          title="Nilai Persediaan"
          value={formatRupiah(value)}
          icon={FileText}
          note="Berdasarkan harga beli"
        />

        <StatCard
          title="Total Barang Masuk"
          value={incoming}
          icon={Download}
          note="Akumulasi transaksi"
        />

        <StatCard
          title="Total Barang Keluar"
          value={outgoing}
          icon={TrendingDown}
          note="Akumulasi transaksi"
        />
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <h2>Aksi Laporan</h2>
            <p>Cetak laporan atau export data persediaan barang.</p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="ghost-btn" onClick={() => window.print()}>
              <Printer size={18} /> Cetak
            </button>

            <button className="primary-btn" onClick={handleExportPDF}>
              <Download size={18} /> Export PDF
            </button>

            <button className="success-btn" onClick={handleExportExcel}>
  <Download size={18} /> Export Excel
</button>
          </div>
        </div>

        <div className="print-note">
          Catatan prototype: export PDF sudah aktif. Export Excel masih berupa
          simulasi dan dapat dikembangkan pada versi berikutnya.
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
                  <th>Stok</th>
                  <th>Harga Beli</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>{p.code}</td>
                    <td>{p.name}</td>
                    <td>
                      {p.stock} {p.unit}
                    </td>
                    <td>{formatRupiah(p.buyPrice)}</td>
                    <td>
                      <StockBadge item={p} />
                    </td>
                  </tr>
                ))}
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

          {critical.map((p) => (
            <div className="detail-row" key={p.id}>
              <span>{p.name}</span>
              <strong>
                {p.stock} {p.unit}
              </strong>
            </div>
          ))}

          {!critical.length && <div className="empty">Tidak ada stok kritis.</div>}
        </div>
      </div>
    </>
  );
}