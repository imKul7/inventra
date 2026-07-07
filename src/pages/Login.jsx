import { useState } from "react";
import { Boxes, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import api from "../services/api";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@inventra.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      onLogin(response.data.user);

    } catch (error) {

      alert(
        error.response?.data?.message ||
        "Email atau Password salah."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="login-wrap">
      <section className="login-hero">
        <div className="logo-badge">
          <Boxes size={34} />
        </div>

        <div>
          <h1>Inventra</h1>

          <p>
            Sistem informasi persediaan barang dagang berbasis web
            dengan simulasi barcode dan rekomendasi restock.
            Dirancang untuk project Interaksi Manusia dan Komputer.
          </p>
        </div>

        <div className="hero-points">
          <div className="hero-point">
            <CheckCircle2 size={20} />
            Dashboard stok yang jelas dan informatif
          </div>

          <div className="hero-point">
            <Zap size={20} />
            Simulasi barcode untuk proses cepat
          </div>

          <div className="hero-point">
            <ShieldCheck size={20} />
            Validasi stok untuk mencegah kesalahan input
          </div>
        </div>
      </section>

      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>

          <h2>Masuk Sistem</h2>

          <p>Login menggunakan akun yang ada di database.</p>

          <div className="field">
            <label>Email</label>

            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Password</label>

            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            className="primary-btn full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Masuk ke Dashboard"}
          </button>

          <div className="demo-note">
            <strong>Akun Admin</strong>

            <br />

            Email : admin@inventra.com

            <br />

            Password : password
          </div>

        </form>
      </section>
    </div>
  );
}