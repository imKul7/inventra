import { Boxes, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

export default function Login({ onLogin }) {
  const submit = (e) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="logo-badge"><Boxes size={34} /></div>
        <div>
          <h1>Inventra</h1>
          <p>Sistem informasi persediaan barang dagang berbasis web dengan simulasi barcode dan rekomendasi restock. Dirancang untuk project Interaksi Manusia dan Komputer.</p>
        </div>
        <div className="hero-points">
          <div className="hero-point"><CheckCircle2 size={20} /> Dashboard stok yang jelas dan informatif</div>
          <div className="hero-point"><Zap size={20} /> Simulasi barcode untuk proses cepat</div>
          <div className="hero-point"><ShieldCheck size={20} /> Validasi stok untuk mencegah kesalahan input</div>
        </div>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <h2>Masuk Sistem</h2>
          <p>Gunakan akun demo untuk masuk ke prototype Inventra.</p>
          <div className="field">
            <label>Username</label>
            <input className="input" defaultValue="admin" />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" defaultValue="admin123" />
          </div>
          <button className="primary-btn full" type="submit">Masuk ke Dashboard</button>
          <div className="demo-note">
            <strong>Akun Demo:</strong><br />Username: admin<br />Password: admin123
          </div>
        </form>
      </section>
    </div>
  );
}
