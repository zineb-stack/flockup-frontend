import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const OBJECTIVES = [
  "Sport", "Lecture", "Productivité", "Santé", "Créativité",
  "Méditation", "Finance", "Apprentissage", "Sommeil", "Alimentation", "Social",
];

const AVATAR_OPTIONS = ["🦊", "🐱", "🐼", "🐨", "🦁", "🐸", "🐧", "🦄", "🐻", "🐰"];

const THEMES = [
  { id: "pastel", label: "Pastel", color: "#E8B4A0" },
  { id: "dark", label: "Sombre", color: "#1C1C1E" },
  { id: "vibrant", label: "Vif", color: "#6366F1" },
];

function Signup() {
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [objectives, setObjectives] = useState([]);
  const [customObjective, setCustomObjective] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [avatar, setAvatar] = useState("🦊");
  const [theme, setTheme] = useState("pastel");

  function toggleObjective(o) {
    setObjectives((prev) =>
      prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]
    );
  }

  function handleStep1Next(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (form.password.length < 4) {
      setError("Le mot de passe doit contenir au moins 4 caractères");
      return;
    }
    setStep(2);
  }

  function handleStep2Next() {
    setStep(3);
  }

  async function handleFinish() {
    setError("");
    try {
      const res = await api.post("/users/", {
        name: form.name,
        email: form.email,
        password: form.password,
      });

      const userId = res.data.id;

      const finalObjectives = customObjective.trim()
        ? [...objectives, customObjective.trim()]
        : objectives;

      await api.put(`/users/${userId}`, {
        avatar_url: avatar,
        objectives: finalObjectives.join(","),
      });

      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("theme", theme);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", res.data.name);

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Erreur lors de l'inscription");
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="signup-progress">
          <div className={`progress-bar ${step >= 1 ? "filled" : ""}`} />
          <div className={`progress-bar ${step >= 2 ? "filled" : ""}`} />
          <div className={`progress-bar ${step >= 3 ? "filled" : ""}`} />
        </div>
        <p className="step-label">Étape {step} sur 3</p>

        {step === 1 && (
          <form onSubmit={handleStep1Next}>
            <h1>Bienvenue sur FlockUp</h1>
            <p className="auth-subtitle">Inscrivez-vous pour commencer.</p>

            <input
              type="text"
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
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
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              required
            />

            {error && <p className="auth-error">{error}</p>}
            <button type="submit">Continuer</button>
          </form>
        )}

        {step === 2 && (
          <div>
            <h1>Ton objectif principal</h1>
            <p className="auth-subtitle">On personnalisera tes recommandations.</p>

            <div className="chip-group">
              {OBJECTIVES.map((o) => (
                <span
                  key={o}
                  className={`chip ${objectives.includes(o) ? "selected" : ""}`}
                  onClick={() => toggleObjective(o)}
                >
                  {o}
                </span>
              ))}
              <span
                className={`chip chip-add ${showCustomInput ? "selected" : ""}`}
                onClick={() => setShowCustomInput(!showCustomInput)}
              >
                + Ajouter le tien
              </span>
            </div>

            {showCustomInput && (
              <input
                type="text"
                placeholder="Ton objectif..."
                value={customObjective}
                onChange={(e) => setCustomObjective(e.target.value)}
                style={{ marginTop: 12 }}
                autoFocus
              />
            )}

            <button onClick={handleStep2Next} style={{ marginTop: 18 }}>
              Continuer
            </button>
            <p className="skip-link" onClick={handleStep2Next}>Passer cette étape</p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1>Personnalise ton profil</h1>
            <p className="auth-subtitle">Choisis ton avatar et ton thème.</p>

            <p className="mini-label">Avatar</p>
            <div className="avatar-grid">
              {AVATAR_OPTIONS.map((emoji) => (
                <span
                  key={emoji}
                  className={`avatar-choice ${avatar === emoji ? "selected" : ""}`}
                  onClick={() => setAvatar(emoji)}
                >
                  {emoji}
                </span>
              ))}
            </div>

            <p className="mini-label" style={{ marginTop: 18 }}>Thème</p>
            <div className="theme-picker">
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  className={`theme-swatch ${theme === t.id ? "selected" : ""}`}
                  onClick={() => {
                    setTheme(t.id);
                    document.documentElement.setAttribute("data-theme", t.id);
                  }}
                >
                  <div className="theme-swatch-dot" style={{ background: t.color }} />
                  {t.label}
                </div>
              ))}
            </div>

            {error && <p className="auth-error">{error}</p>}
            <button onClick={handleFinish} style={{ marginTop: 18 }}>
              Terminer l'inscription
            </button>
          </div>
        )}

        {step === 1 && (
          <p className="auth-switch">
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Signup;
