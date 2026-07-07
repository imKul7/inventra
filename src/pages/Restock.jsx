import { RefreshCcw, AlertTriangle, PackagePlus, CheckCircle2 } from "lucide-react";
import Topbar from "../components/Topbar";
import StockBadge from "../components/StockBadge";
import StatCard from "../components/StatCard";
import { getStockStatus, getRestockSuggestion } from "../utils";

export default function Restock({ products = [], setActivePage }) {
  const items = products
    .filter((p) => getStockStatus(p) !== "Aman")
    .sort((a, b) => {
      const statusA = getStockStatus(a);
      const statusB = getStockStatus(b);

      if (statusA === "Habis" && statusB !== "Habis") return -1;
      if (statusA !== "Habis" && statusB === "Habis") return 1;

      return Number(a.stock || 0) - Number(b.stock || 0);
    });

  const emptyItems = items.filter((p) => getStockStatus(p) === "Habis");
  const lowItems = items.filter((p) => getStockStatus(p) === "Menipis");

  const totalSuggestion = items.reduce((sum, p) => {
    return sum + Number(getRestockSuggestion(p) || 0);
  }, 0);

  return (
    <>
      <Topbar
        title="Rekomendasi Restock"
        subtitle="Daftar barang yang stoknya berada di bawah batas minimum dan perlu segera ditambah."
      />

      <div className="grid stats">
        <StatCard
          title="Perlu Restock"
          value={items.length}
          icon={AlertTriangle}
          note="Barang tidak aman"
        />

        <StatCard
          title="Stok Habis"
          value={emptyItems.length}
          icon={AlertTriangle}
          note="Prioritas utama"
        />

        <StatCard
          title="Stok Menipis"
          value={lowItems.length}
          icon={PackagePlus}
          note="Perlu dipantau"
        />

        <StatCard
          title="Total Saran Restock"
          value={totalSuggestion}
          icon={RefreshCcw}
          note="Estimasi jumlah tambahan"
        />
      </div>

      <div className="alert" style={{ marginTop: 18 }}>
        <AlertTriangle size={18} style={{ verticalAlign: "middle" }} />{" "}
        Sistem menghitung rekomendasi berdasarkan stok saat ini dan stok
        minimum. Barang dengan status <strong>Habis</strong> menjadi prioritas
        tertinggi.
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <div>
            <h2>Barang Perlu Restock</h2>
            <p>
              Data diambil langsung dari database produk. Prioritaskan barang
              dengan status Habis dan Menipis.
            </p>
          </div>

          <button
            className="primary-btn"
            onClick={() => setActivePage("incoming")}
          >
            <RefreshCcw size={18} />
            Restock Sekarang
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Supplier</th>
                <th>Stok</th>
                <th>Minimum</th>
                <th>Status</th>
                <th>Rekomendasi</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((p) => (
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

                    <td>
                      <StockBadge item={p} />
                    </td>

                    <td>
                      <strong>
                        Restock {getRestockSuggestion(p)} {p.unit}
                      </strong>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty">
                      <CheckCircle2 size={18} /> Semua stok dalam kondisi aman.
                    </div>
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