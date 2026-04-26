import { getStockStatus } from '../utils';

export default function StockBadge({ item, status }) {
  const finalStatus = status || getStockStatus(item);
  return <span className={`badge ${finalStatus}`}>{finalStatus}</span>;
}
