export const formatRupiah = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);
export const today = () => new Date().toISOString().slice(0, 10);
export const getStockStatus = (item) => {
  if (Number(item.stock) <= 0) return 'Habis';
  if (Number(item.stock) <= Number(item.minStock)) return 'Menipis';
  return 'Aman';
};
export const getRestockSuggestion = (item) => Math.max(Number(item.minStock) * 2 - Number(item.stock), Number(item.minStock));
