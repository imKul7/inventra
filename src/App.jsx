import { useEffect, useState } from "react";

import AuthService from "./services/authService";
import ProductService from "./services/productService";
import CategoryService from "./services/categoryService";
import SupplierService from "./services/supplierService";

import Sidebar from "./components/Sidebar";
import Toast from "./components/Toast";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataBarang from "./pages/DataBarang";
import StockForm from "./pages/StockForm";
import BarcodeScanner from "./pages/BarcodeScanner";
import Restock from "./pages/Restock";
import Laporan from "./pages/Laporan";

import { initialTransactions } from "./data/products";

export default function App() {
  // ==========================
  // AUTH
  // ==========================

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ==========================
  // NAVIGATION
  // ==========================

  const [activePage, setActivePage] = useState("dashboard");

  // ==========================
  // DATA DARI API
  // ==========================

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // sementara transaksi lama masih dipakai sampai Stock Movement API disambungkan ke React
  const [transactions, setTransactions] = useState(initialTransactions);

  // ==========================
  // TOAST
  // ==========================

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({
      message,
      type,
    });
  };

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // ==========================
  // LOAD PRODUCTS
  // ==========================

  async function loadProducts() {
    try {
      const data = await ProductService.getAll();

      const formatted = data.map((item) => ({
        id: item.id,

        categoryId: item.category_id,
        supplierId: item.supplier_id,

        code: item.kode_barang,
        name: item.nama_barang,

        category: item.category?.nama_kategori || "-",
        supplier: item.supplier?.nama_supplier || "-",

        buyPrice: item.harga_beli ?? item.harga ?? 0,
        sellPrice: item.harga ?? 0,

        stock: item.stok ?? 0,
        minStock: item.stok_minimum ?? 0,

        unit: item.satuan || "pcs",
        barcode: item.barcode || "",
        status: item.status || "aktif",
        description: item.deskripsi || "",
      }));

      setProducts(formatted);
    } catch (err) {
      console.error("Gagal load products:", err);
    }
  }

  // ==========================
  // LOAD CATEGORIES
  // ==========================

  async function loadCategories() {
    try {
      const data = await CategoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error("Gagal load categories:", err);
    }
  }

  // ==========================
  // LOAD SUPPLIERS
  // ==========================

  async function loadSuppliers() {
    try {
      const data = await SupplierService.getAll();
      setSuppliers(data);
    } catch (err) {
      console.error("Gagal load suppliers:", err);
    }
  }

  // ==========================
  // LOAD SEMUA DATA MASTER
  // ==========================

  async function loadMasterData() {
    await Promise.all([
      loadProducts(),
      loadCategories(),
      loadSuppliers(),
    ]);
  }

  useEffect(() => {
    if (loggedIn) {
      loadMasterData();
    }
  }, [loggedIn]);

  // ==========================
  // NAVIGATION
  // ==========================

  function handleChangePage(pageName) {
    setActivePage(pageName);

    setTimeout(() => {
      const mainElement = document.querySelector(".main");

      if (mainElement) {
        mainElement.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }, 100);
  }

  // ==========================
  // LOGIN
  // ==========================

  function handleLogin(userData) {
    setLoggedIn(true);
    setUser(userData);

    showToast("Login berhasil.");
  }

  // ==========================
  // LOGOUT
  // ==========================

  async function handleLogout() {
  try {
    await AuthService.logout();
  } catch (error) {
    console.error("Logout API gagal:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setLoggedIn(false);
    setUser(null);
    setActivePage("dashboard");

    setProducts([]);
    setCategories([]);
    setSuppliers([]);

    showToast("Logout berhasil.");
  }
}

  // ==========================
  // BELUM LOGIN
  // ==========================

  if (!loggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  // ==========================
  // SHARED PROPS
  // ==========================

  const props = {
    user,

    products,
    setProducts,
    loadProducts,

    categories,
    setCategories,
    loadCategories,

    suppliers,
    setSuppliers,
    loadSuppliers,

    loadMasterData,

    transactions,
    setTransactions,

    showToast,
    setActivePage: handleChangePage,
  };

  // ==========================
  // ROUTING
  // ==========================

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard {...props} />;

      case "products":
        return <DataBarang {...props} />;

      case "incoming":
        return <StockForm {...props} type="masuk" />;

      case "outgoing":
        return <StockForm {...props} type="keluar" />;

      case "barcode":
        return <BarcodeScanner {...props} />;

      case "restock":
        return <Restock {...props} />;

      case "reports":
        return <Laporan {...props} />;

      default:
        return <Dashboard {...props} />;
    }
  };

  // ==========================
  // UI
  // ==========================

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={handleChangePage}
        onLogout={handleLogout}
      />

      <main className="main">
        {renderPage()}
      </main>

      <Toast toast={toast} />
    </div>
  );
}