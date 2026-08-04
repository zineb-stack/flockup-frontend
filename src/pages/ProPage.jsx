import { useState } from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  { title: "Habitudes illimitées", desc: "Plus de limite sur le nombre d'habitudes" },
  { title: "Statistiques avancées", desc: "Historique complet et graphiques détaillés" },
  { title: "Channels illimités", desc: "Crée et rejoins autant de channels que tu veux" },
  { title: "Thèmes exclusifs", desc: "Personnalisation avancée de l'application" },
];

function ProPage() {
  const [plan, setPlan] = useState("monthly");
  const navigate = useNavigate();

  function handleSubscribe() {
    alert("Merci pour ton intérêt ! Les paiements seront bientôt disponibles.");
  }

  return (
    <div className="page">
      <span className="back-link" onClick={() => navigate(-1)}>‹ Retour</span>

      <div className="pro-header">
        <div className="pro-crown-badge">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M3 8l4 3 5-6 5 6 4-3-2 10H5L3 8z" />
          </svg>
        </div>
        <p className="pro-title">FlockUp Pro</p>
        <p className="pro-subtitle">Débloque tout le potentiel de tes habitudes</p>
      </div>

      <div className="pro-features-card">
        {FEATURES.map((f) => (
          <div key={f.title} className="pro-feature-row">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="pro-check-icon">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <div>
              <p className="pro-feature-title">{f.title}</p>
              <p className="pro-feature-desc">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="pro-plans-row">
        <div
          className={`pro-plan-box ${plan === "monthly" ? "selected" : ""}`}
          onClick={() => setPlan("monthly")}
        >
          <p className="pro-plan-label">POPULAIRE</p>
          <p className="pro-plan-price">29 MAD</p>
          <p className="pro-plan-period">par mois</p>
        </div>
        <div
          className={`pro-plan-box ${plan === "yearly" ? "selected" : ""}`}
          onClick={() => setPlan("yearly")}
        >
          <p className="pro-plan-label">ANNUEL</p>
          <p className="pro-plan-price">249 MAD</p>
          <p className="pro-plan-period">par an</p>
        </div>
      </div>

      <button className="pro-subscribe-btn" onClick={handleSubscribe}>
        Passer à Pro
      </button>
    </div>
  );
}

export default ProPage;