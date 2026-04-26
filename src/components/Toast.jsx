import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function Toast({ toast }) {
  if (!toast) return null;
  const Icon = toast.type === 'error' ? AlertTriangle : CheckCircle2;
  return <div className={`toast ${toast.type || 'success'}`}><Icon size={20} /> {toast.message}</div>;
}
