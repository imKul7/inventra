import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import Toast from './components/Toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DataBarang from './pages/DataBarang';
import StockForm from './pages/StockForm';
import BarcodeScanner from './pages/BarcodeScanner';
import Restock from './pages/Restock';
import Laporan from './pages/Laporan';
import { initialProducts, initialTransactions } from './data/products';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!loggedIn) return <Login onLogin={() => setLoggedIn(true)} />;

  const props = { products, setProducts, transactions, setTransactions, showToast, setActivePage };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard {...props} />;
      case 'products': return <DataBarang {...props} />;
      case 'incoming': return <StockForm {...props} type="masuk" />;
      case 'outgoing': return <StockForm {...props} type="keluar" />;
      case 'barcode': return <BarcodeScanner {...props} />;
      case 'restock': return <Restock {...props} />;
      case 'reports': return <Laporan {...props} />;
      default: return <Dashboard {...props} />;
    }
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} onLogout={() => setLoggedIn(false)} />
      <main className="main">{renderPage()}</main>
      <Toast toast={toast} />
    </div>
  );
}
