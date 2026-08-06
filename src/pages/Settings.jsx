import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { updateUser, deleteUser, getUser, sendFeedback, getCurrentUserId } from "../services/api";

const THEMES = [
  { id: "pastel", label: "Pastel", color: "#E8B4A0" },
  { id: "dark", label: "Sombre", color: "#1C1C1E" },
  { id: "vibrant", label: "Vif", color: "#6366F1" },
];
function Settings() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState(searchParams.get("view") || "main");
  const [rating, setRating] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  useEffect(() => {
    const v = searchParams.get("view");
    if (v) setView(v);
  }, [searchParams]);

  const [accountForm, setAccountForm] = useState({ name: "", password: "", confirmPassword: "" });
  const [saved, setSaved] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "pastel");
  const [user, setUser] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const userId = getCurrentUserId();
  const navigate = useNavigate();

  useEffect(() => {
    getUser(userId).then((res) => setUser(res.data)).catch(console.error);
  }, []);

  function applyTheme(t) {
    setTheme(t);
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  }

  async function handleAccountSave(e) {
    e.preventDefault();
    setPasswordError("");

    if (accountForm.password && accountForm.password !== accountForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      const payload = {};
      if (accountForm.name.trim()) payload.name = accountForm.name;
      await updateUser(userId, payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  }

  async function handleDeleteAccount() {
    if (!confirm("Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.")) return;
    try {
      await deleteUser(userId);
      localStorage.clear();
      navigate("/signup");
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  function handleShare() {
    const shareUrl = window.location.origin;
    if (navigator.share) {
      navigator.share({ title: "FlockUp", text: "Rejoins-moi sur FlockUp !", url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Lien copié dans le presse-papier !");
    }
  }

  async function handleSendFeedback() {
    if (rating === 0) {
      alert("Choisis une note avant d'envoyer.");
      return;
    }
    try {
      await sendFeedback({ rating, message: feedbackMsg, user_email: user?.email });
      setFeedbackSent(true);
      setRating(0);
      setFeedbackMsg("");
      setTimeout(() => setFeedbackSent(false), 3000);
    } catch (err) {
      alert("Erreur lors de l'envoi du feedback");
    }
  }

  if (view === "account") {
    return (
      <div className="page">
        <div className="settings-subheader">
          <span className="back-link" onClick={() => setView("main")}>‹ Retour</span>
          <h1>Compte</h1>
        </div>

        <div className="account-avatar-row" onClick={() => navigate("/profile")}>
          <div className="account-avatar-circle">{user?.avatar_url || "🙂"}</div>
          <div className="account-avatar-text">
            <p className="account-avatar-title">Modifier ma photo</p>
            <p className="account-avatar-sub">Depuis la page Profil</p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
        </div>

        <form onSubmit={handleAccountSave} className="detail-form">
          <label>Email</label>
          <input value={user?.email || ""} disabled className="input-readonly" />

          <label>Nom</label>
          <input
            placeholder="Nouveau nom"
            value={accountForm.name}
            onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
          />

          <label>Nouveau mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={accountForm.password}
            onChange={(e) => setAccountForm({ ...accountForm, password: e.target.value })}
          />

          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            placeholder="••••••••"
            value={accountForm.confirmPassword}
            onChange={(e) => setAccountForm({ ...accountForm, confirmPassword: e.target.value })}
          />

          {passwordError && <p className="auth-error">{passwordError}</p>}

          <div className="detail-form-actions">
            <button type="submit" className="btn-confirm">Enregistrer</button>
          </div>
          {saved && <p className="save-confirm">✓ Modifications enregistrées</p>}
        </form>

        <div className="danger-zone">
          <p className="danger-zone-title">Zone dangereuse</p>
          <button className="btn-delete-account" onClick={handleDeleteAccount}>
            Supprimer mon compte
          </button>
        </div>
      </div>
    );
  }

  if (view === "faq") {
    const faqs = [
      { q: "Comment fonctionne le score IA ?", a: "Notre modèle analyse ton historique (streak, régularité) pour estimer tes chances de réussir une habitude aujourd'hui." },
      { q: "Comment rejoindre un channel ?", a: "Va dans l'onglet Channels, choisis-en un dans les recommandations ou crée le tien." },
      { q: "Puis-je supprimer une habitude ?", a: "Oui, depuis la page d'accueil ou le détail de l'habitude." },
      { q: "Mes données sont-elles privées ?", a: "Tes habitudes personnelles sont privées, seules les publications dans un channel sont visibles par ses membres." },
    ];
    return (
      <div className="page">
        <div className="settings-subheader">
          <span className="back-link" onClick={() => setView("main")}>‹ Retour</span>
          <h1>FAQ</h1>
        </div>
        {faqs.map((f, i) => (
          <div key={i} className="faq-item">
            <p className="faq-q">{f.q}</p>
            <p className="faq-a">{f.a}</p>
          </div>
        ))}
      </div>
    );
  }

  if (view === "contact") {
    return (
      <div className="page">
        <div className="settings-subheader">
          <span className="back-link" onClick={() => setView("main")}>‹ Retour</span>
          <h1>Feedback</h1>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-sub)", marginBottom: 16 }}>
          Une question, un bug, une suggestion ? Écris-nous :
        </p>
        <div className="card" style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14 }}>support@flockup.app</p>
        </div>

        <div className="feedback-card">
          <p className="feedback-title">Tu apprécies FlockUp ?</p>
          <p className="feedback-sub">Dis-nous ce que tu en penses</p>

          <div className="feedback-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span
                key={n}
                className={`feedback-star ${n <= rating ? "filled" : ""}`}
                onClick={() => setRating(n)}
              >
                ★
              </span>
            ))}
          </div>

          <textarea
            className="feedback-textarea"
            placeholder="Ton avis (optionnel)..."
            value={feedbackMsg}
            onChange={(e) => setFeedbackMsg(e.target.value)}
            rows={3}
          />

          <button className="btn-confirm" style={{ width: "100%" }} onClick={handleSendFeedback}>
            Envoyer mon avis
          </button>

          {feedbackSent && <p className="save-confirm">✓ Merci pour ton retour !</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Paramètres</h1>
      </div>

      <p className="section-label">Apparence</p>
      <div className="theme-picker">
        {THEMES.map((t) => (
          <div
            key={t.id}
            className={`theme-swatch ${theme === t.id ? "selected" : ""}`}
            onClick={() => applyTheme(t.id)}
          >
            <div className="theme-swatch-dot" style={{ background: t.color }} />
            {t.label}
          </div>
        ))}
      </div>

      <div className="settings-group">
        <div className="settings-row" onClick={() => setView("account")}>
          <span>Compte</span>
          <span className="chevron-sm">›</span>
        </div>
        <div className="settings-row">
          <span>Langue</span>
          <span className="settings-value">Français</span>
        </div>
      </div>

      <div className="settings-group">
        <div className="settings-row" onClick={() => setView("faq")}>
          <span>FAQ</span>
          <span className="chevron-sm">›</span>
        </div>
        <div className="settings-row" onClick={() => setView("contact")}>
          <span>Feedback</span>
          <span className="chevron-sm">›</span>
        </div>
        <div className="settings-row" onClick={handleShare}>
          <span>Partager l'app</span>
          <span className="chevron-sm">›</span>
        </div>
      </div>

      <p className="settings-footer">FlockUp v0.1.0 — MVP</p>
    </div>
  );
}

export default Settings;
