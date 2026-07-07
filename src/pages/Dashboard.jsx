import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Boxes,
  AlertTriangle,
  Ban,
  Layers,
  TrendingUp,
} from "lucide-react";

import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import StockBadge from "../components/StockBadge";
import { getStockStatus } from "../utils";
import DashboardService from "../services/dashboardService";

export default function Dashboard({
  products,
  transactions,
  setActivePage,
}) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      setLoading(true);

      const data = await DashboardService.getSummary();

      setSummary(data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const fallbackLow = products.filter(
    (p) => getStockStatus(p) === "Menipis"
  ).length;

  const fallbackEmpty = products.filter(
    (p) => getStockStatus(p) === "Habis"
  ).length;

  const fallbackCategories = new Set(
    products.map((p) => p.category)
  ).size;

  const totalProducts =
    summary?.total_products ?? products.length;

  const totalCategories =
    summary?.total_categories ?? fallbackCategories;

  const lowStock =
    summary?.low_stock ?? fallbackLow;

  const outOfStock =
    summary?.out_of_stock ?? fallbackEmpty;

  const totalStock =
    summary?.total_stock ?? products.reduce((sum, p) => sum + Number(p.stock || 0), 0);

  const recentActivities =
    summary?.recent_activities ?? [];

  const criticalProducts = useMemo(() => {
    return products
      .filter((p) => getStockStatus(p) !== "Aman")
      .slice(0, 6);
  }, [products]);

  const chartData = useMemo(() => {
    return products.slice(0, 7).map((p) => ({
      name: p.code,
      stok: Number(p.stock),
      minimum: Number(p.minStock),
    }));
  }, [products]);

  const pieData = useMemo(() => {
    return [
      {
        name: "Aman",
        value: products.filter(
          (p) => getStockStatus(p) === "Aman"
        ).length,
      },
      {
        name: "Menipis",
        value: products.filter(
          (p) => getStockStatus(p) === "Menipis"
        ).length,
      },
      {
        name: "Habis",
        value: products.filter(
          (p) => getStockStatus(p) === "Habis"
        ).length,
      },
    ];
  }, [products]);

  return (
    <>
      <Topbar
        title="Dashboard Persediaan"
        subtitle="Pantau stok barang, aktivitas gudang, dan rekomendasi restock dalam satu halaman."
      />

      <div className="grid stats">
        <StatCard
          title="Total Barang"
          value={loading ? "..." : totalProducts}
          icon={Boxes}
          note="Data dari database"
        />

        <StatCard
          title="Total Kategori"
          value={loading ? "..." : totalCategories}
          icon={Layers}
          note="Kategori barang"
        />

        <StatCard
          title="Stok Menipis"
          value={loading ? "..." : lowStock}
          icon={AlertTriangle}
          note="Perlu dipantau"
        />

        <StatCard
          title="Stok Habis"
          value={loading ? "..." : outOfStock}
          icon={Ban}
          note="Prioritas restock"
        />
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Grafik Stok vs Minimum</h2>
              <p>
                Perbandingan stok saat ini dengan batas minimum.
                Total stok saat ini: <strong>{totalStock}</strong>
              </p>
            </div>
          </div>

          <div style={{ width: "100%", height: 320 }}>
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
            <div>
              <h2>Status Stok</h2>
              <p>Distribusi kondisi barang berdasarkan data terbaru.</p>
            </div>
          </div>

          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={90}
                  label
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <button
            className="ghost-btn full"
            onClick={() => setActivePage("restock")}
          >
            <TrendingUp size={18} />
            Lihat Rekomendasi Restock
          </button>
        </div>
      </div>

      <div className="grid two-col">
        <div className="card">
          <div className="card-head">
            <div>
              <h2>Barang Prioritas</h2>
              <p>Barang yang harus segera diperhatikan.</p>
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Barang</th>
                  <th>Stok</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {criticalProducts.length > 0 ? (
                  criticalProducts.map((p) => (
                    <tr key={p.id}>
                      <td>{p.code}</td>
                      <td>{p.name}</td>
                      <td>
                        {p.stock} {p.unit}
                      </td>
                      <td>
                        <StockBadge item={p} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">
                      Semua stok masih dalam kondisi aman.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Aktivitas Terbaru</h2>
              <p>Riwayat transaksi stok dari database.</p>
            </div>
          </div>

          {recentActivities.length > 0 ? (
            recentActivities.map((item) => (
              <div className="detail-row" key={item.id}>
                <span>
                  <span className={`badge ${item.type}`}>
                    {item.type}
                  </span>{" "}
                  {item.product?.nama_barang || "Produk tidak ditemukan"}
                </span>

                <strong>
                  {item.jumlah}
                </strong>
              </div>
            ))
          ) : transactions && transactions.length > 0 ? (
            transactions.slice(0, 5).map((t) => (
              <div className="detail-row" key={t.id}>
                <span>
                  <span className={`badge ${t.type}`}>
                    {t.type}
                  </span>{" "}
                  {t.productName}
                </span>

                <strong>{t.qty}</strong>
              </div>
            ))
          ) : (
            <div className="alert">
              Belum ada aktivitas stok terbaru.
            </div>
          )}
        </div>
      </div>
    </>
  );
}