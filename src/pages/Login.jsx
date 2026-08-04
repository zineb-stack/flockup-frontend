import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/users/login", form);
      localStorage.setItem("userId", res.data.id);
      localStorage.setItem("userName", res.data.name);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Email ou mot de passe incorrect");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Bon retour</h1>
        <p className="auth-subtitle">Connecte-toi pour continuer</p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit">Se connecter</button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
