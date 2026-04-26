export const initialProducts = [
  { id: 1, code: 'BRG001', name: 'Beras Premium 5kg', category: 'Sembako', supplier: 'PT Sumber Pangan', buyPrice: 62000, sellPrice: 69500, stock: 12, minStock: 10, unit: 'sak' },
  { id: 2, code: 'BRG002', name: 'Minyak Goreng 1L', category: 'Sembako', supplier: 'PT Nusantara Jaya', buyPrice: 14500, sellPrice: 17000, stock: 6, minStock: 12, unit: 'botol' },
  { id: 3, code: 'BRG003', name: 'Gula Pasir 1kg', category: 'Sembako', supplier: 'CV Manis Sentosa', buyPrice: 13500, sellPrice: 16000, stock: 0, minStock: 8, unit: 'pack' },
  { id: 4, code: 'BRG004', name: 'Kopi Sachet', category: 'Minuman', supplier: 'PT Aroma Kopi', buyPrice: 1100, sellPrice: 1500, stock: 25, minStock: 15, unit: 'pcs' },
  { id: 5, code: 'BRG005', name: 'Sabun Mandi', category: 'Kebersihan', supplier: 'PT Bersih Sehat', buyPrice: 3200, sellPrice: 4500, stock: 9, minStock: 10, unit: 'pcs' },
  { id: 6, code: 'BRG006', name: 'Teh Celup 25pcs', category: 'Minuman', supplier: 'PT Daun Segar', buyPrice: 7200, sellPrice: 9500, stock: 34, minStock: 18, unit: 'box' },
  { id: 7, code: 'BRG007', name: 'Tisu Wajah', category: 'Kebersihan', supplier: 'CV Rumah Bersih', buyPrice: 6900, sellPrice: 9000, stock: 4, minStock: 14, unit: 'pack' },
  { id: 8, code: 'BRG008', name: 'Mi Instan Goreng', category: 'Makanan', supplier: 'PT Rasa Nusantara', buyPrice: 2800, sellPrice: 3500, stock: 48, minStock: 30, unit: 'pcs' },
  { id: 9, code: 'BRG009', name: 'Air Mineral 600ml', category: 'Minuman', supplier: 'PT Tirta Murni', buyPrice: 2200, sellPrice: 3500, stock: 15, minStock: 24, unit: 'botol' },
  { id: 10, code: 'BRG010', name: 'Detergen Bubuk 800g', category: 'Kebersihan', supplier: 'PT Bersih Sehat', buyPrice: 14200, sellPrice: 17500, stock: 19, minStock: 12, unit: 'pack' }
];

export const categories = ['Semua', 'Sembako', 'Minuman', 'Kebersihan', 'Makanan'];
export const suppliers = ['PT Sumber Pangan', 'PT Nusantara Jaya', 'CV Manis Sentosa', 'PT Aroma Kopi', 'PT Bersih Sehat', 'PT Daun Segar', 'CV Rumah Bersih', 'PT Rasa Nusantara', 'PT Tirta Murni'];

export const initialTransactions = [
  { id: 1, type: 'masuk', code: 'BRG001', productName: 'Beras Premium 5kg', qty: 20, date: '2026-04-20', note: 'Pembelian awal dari supplier' },
  { id: 2, type: 'keluar', code: 'BRG002', productName: 'Minyak Goreng 1L', qty: 8, date: '2026-04-21', note: 'Penjualan harian' },
  { id: 3, type: 'keluar', code: 'BRG003', productName: 'Gula Pasir 1kg', qty: 5, date: '2026-04-22', note: 'Terjual habis' },
  { id: 4, type: 'masuk', code: 'BRG006', productName: 'Teh Celup 25pcs', qty: 12, date: '2026-04-23', note: 'Restock ringan' },
  { id: 5, type: 'keluar', code: 'BRG009', productName: 'Air Mineral 600ml', qty: 18, date: '2026-04-24', note: 'Penjualan event' }
];
