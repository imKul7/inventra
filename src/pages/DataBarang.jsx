import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Trash2, Edit3, Save } from "lucide-react";

import Topbar from "../components/Topbar";
import StockBadge from "../components/StockBadge";
import ProductService from "../services/productService";

import { formatRupiah, getStockStatus } from "../utils";

const initialForm = {
  code: "",
  name: "",
  categoryId: "",
  supplierId: "",
  sellPrice: "",
  stock: "",
  minStock: "",
  unit: "pcs",
  barcode: "",
  status: "aktif",
  description: "",
};

export default function DataBarang({
  products = [],
  categories = [],
  suppliers = [],
  showToast,
  loadProducts,
}) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [selectedStatus, setSelectedStatus] = useState("Semua");

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!editingId) {
      setForm((prev) => ({
        ...prev,
        categoryId: prev.categoryId || categories?.[0]?.id || "",
        supplierId: prev.supplierId || suppliers?.[0]?.id || "",
      }));
    }
  }, [categories, suppliers, editingId]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery = `${p.code} ${p.name}`
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesCategory =
        selectedCategory === "Semua" || p.category === selectedCategory;

      const matchesStatus =
        selectedStatus === "Semua" || getStockStatus(p) === selectedStatus;

      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [products, query, selectedCategory, selectedStatus]);

  function reset() {
    setForm({
      ...initialForm,
      categoryId: categories?.[0]?.id || "",
      supplierId: suppliers?.[0]?.id || "",
    });

    setEditingId(null);
  }

  function generateCode() {
    const nextNumber = products.length + 1;

    setForm((prev) => ({
      ...prev,
      code: `BRG${String(nextNumber).padStart(3, "0")}`,
      barcode: `8990000000${String(nextNumber).padStart(3, "0")}`,
    }));
  }

  async function save(e) {
    e.preventDefault();

    if (
      !form.code ||
      !form.name ||
      !form.categoryId ||
      !form.supplierId ||
      form.sellPrice === "" ||
      form.stock === "" ||
      form.minStock === "" ||
      !form.unit ||
      !form.barcode
    ) {
      showToast("Lengkapi semua data barang.", "error");
      return;
    }

    const payload = {
      category_id: Number(form.categoryId),
      supplier_id: Number(form.supplierId),
      kode_barang: form.code,
      nama_barang: form.name,
      deskripsi: form.description || null,
      harga: Number(form.sellPrice),
      stok: Number(form.stock),
      stok_minimum: Number(form.minStock),
      satuan: form.unit,
      barcode: form.barcode,
      status: form.status || "aktif",
    };

    try {
      setSaving(true);

      if (editingId) {
        await ProductService.update(editingId, payload);
        showToast("Data barang berhasil diperbarui.");
      } else {
        await ProductService.create(payload);
        showToast("Barang baru berhasil ditambahkan.");
      }

      reset();
      await loadProducts();
    } catch (error) {
      console.error("Gagal menyimpan barang:", error);

      const message =
        error.response?.data?.message ||
        "Gagal menyimpan data barang.";

      showToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  function edit(item) {
    setForm({
      code: item.code || "",
      name: item.name || "",
      categoryId: item.categoryId || "",
      supplierId: item.supplierId || "",
      sellPrice: item.sellPrice || "",
      stock: item.stock || "",
      minStock: item.minStock || "",
      unit: item.unit || "pcs",
      barcode: item.barcode || "",
      status: item.status || "aktif",
      description: item.description || "",
    });

    setEditingId(item.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function remove(id) {
    const confirmed = window.confirm(
      "Yakin ingin menghapus data barang ini?"
    );

    if (!confirmed) return;

    try {
      await ProductService.delete(id);
      showToast("Data barang berhasil dihapus.");
      await loadProducts();
    } catch (error) {
      console.error("Gagal menghapus barang:", error);

      const message =
        error.response?.data?.message ||
        "Gagal menghapus data barang.";

      showToast(message, "error");
    }
  }

  return (
    <>
      <Topbar
        title="Data Barang"
        subtitle="Kelola data produk, kategori, supplier, harga, dan status stok barang dari database."
      />

      <div className="grid two-col">
        <form className="card" onSubmit={save}>
          <div className="card-head">
            <div>
              <h2>{editingId ? "Edit Barang" : "Tambah Barang"}</h2>
              <p>Data akan langsung tersimpan ke database MySQL.</p>
            </div>
          </div>

          <div className="form-grid">
            <div className="field">
              <label>Kode Barang</label>
              <input
                className="input"
                value={form.code}
                onChange={(e) =>
                  setForm({
                    ...form,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="BRG011"
              />
            </div>

            <div className="field">
              <label>Nama Barang</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Nama produk"
              />
            </div>

            <div className="field">
              <label>Kategori</label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    categoryId: e.target.value,
                  })
                }
              >
                <option value="">Pilih kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Supplier</label>
              <select
                value={form.supplierId}
                onChange={(e) =>
                  setForm({
                    ...form,
                    supplierId: e.target.value,
                  })
                }
              >
                <option value="">Pilih supplier</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nama_supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Harga Jual</label>
              <input
                className="input"
                type="number"
                value={form.sellPrice}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sellPrice: e.target.value,
                  })
                }
                placeholder="15000"
              />
            </div>

            <div className="field">
              <label>Stok</label>
              <input
                className="input"
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    stock: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Stok Minimum</label>
              <input
                className="input"
                type="number"
                value={form.minStock}
                onChange={(e) =>
                  setForm({
                    ...form,
                    minStock: e.target.value,
                  })
                }
              />
            </div>

            <div className="field">
              <label>Satuan</label>
              <input
                className="input"
                value={form.unit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    unit: e.target.value,
                  })
                }
                placeholder="pcs"
              />
            </div>

            <div className="field">
              <label>Barcode</label>
              <input
                className="input"
                value={form.barcode}
                onChange={(e) =>
                  setForm({
                    ...form,
                    barcode: e.target.value,
                  })
                }
                placeholder="8990000000011"
              />
            </div>

            <div className="field">
              <label>Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>Deskripsi</label>
            <textarea
              className="input"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              placeholder="Deskripsi barang"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button
              className="primary-btn"
              type="submit"
              disabled={saving}
            >
              <Save size={18} />
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>

            <button
              className="ghost-btn"
              type="button"
              onClick={reset}
            >
              Reset
            </button>
          </div>
        </form>

        <div className="card">
          <div className="card-head">
            <div>
              <h2>Ringkasan Sistem</h2>
              <p>Data barang sudah terhubung ke Laravel API dan MySQL.</p>
            </div>
          </div>

          <div className="alert">
            Tambah, edit, dan hapus barang sekarang akan langsung memengaruhi
            database serta otomatis memperbarui dashboard.
          </div>

          <button
            className="primary-btn full"
            type="button"
            onClick={generateCode}
          >
            <Plus size={18} />
            Buat Kode Otomatis
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search">
              <input
                className="input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari kode atau nama barang..."
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="Semua">Semua</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nama_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {["Semua", "Aman", "Menipis", "Habis"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button className="ghost-btn" type="button">
            <Search size={18} />
            {filtered.length} hasil
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
  <tr>
    <th>Kode</th>
    <th>Nama</th>
    <th>Kategori</th>
    <th>Supplier</th>
    <th>Harga Jual</th>
    <th>Stok</th>
    <th>Stok Minimum</th>
    <th>Satuan</th>
    <th>Barcode</th>
    <th>Deskripsi</th>
    <th>Status</th>
    <th>Aksi</th>
  </tr>
</thead>

            <tbody>
  {filtered.length > 0 ? (
    filtered.map((p) => (
      <tr key={p.id}>
        <td>{p.code}</td>

        <td>{p.name}</td>

        <td>{p.category}</td>

        <td>{p.supplier}</td>

        <td>{formatRupiah(p.sellPrice)}</td>

        <td>{p.stock}</td>

        <td>{p.minStock}</td>

        <td>{p.unit}</td>

        <td>{p.barcode || "-"}</td>

        <td>{p.description || "-"}</td>

        <td>
          <StockBadge item={p} />
        </td>

        <td>
          <button
            className="ghost-btn"
            type="button"
            onClick={() => edit(p)}
          >
            <Edit3 size={15} />
          </button>

          <button
            className="danger-btn"
            type="button"
            onClick={() => remove(p.id)}
          >
            <Trash2 size={15} />
          </button>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="12">Data barang tidak ditemukan.</td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>
    </>
  );
}