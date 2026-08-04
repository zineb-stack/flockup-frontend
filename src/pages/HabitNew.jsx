import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createHabit, getCurrentUserId } from "../services/api";

const CATEGORIES = [
  "Lecture", "Sport", "Méditation", "Santé", "Productivité",
  "Finance", "Apprentissage", "Sommeil", "Alimentation", "Social", "Créativité",
];

const DAYS = [
  { key: "lun", label: "L" },
  { key: "mar", label: "M" },
  { key: "mer", label: "M" },
  { key: "jeu", label: "J" },
  { key: "ven", label: "V" },
  { key: "sam", label: "S" },
  { key: "dim", label: "D" },
];

function HabitNew() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [freqMode, setFreqMode] = useState("daily");
  const [selectedDays, setSelectedDays] = useState([]);
  const navigate = useNavigate();

  function toggleDay(key) {
    setSelectedDays((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const frequency = freqMode === "daily" ? "daily" : selectedDays.join(",");

    try {
      await createHabit(getCurrentUserId(), {
        title,
        category: category || null,
        frequency: frequency || "daily",
      });
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nouvelle habitude</h1>
      </div>

      <form onSubmit={handleSubmit} className="detail-form">
        <label>Titre</label>
        <input
          placeholder="Ex: Méditation 10min"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          autoFocus
          required
        />

        <label>Catégorie</label>
        <div className="chip-group">
          {CATEGORIES.map((c) => (
            <span
              key={c}
              className={`chip ${category === c ? "selected" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </span>
          ))}
        </div>

        <label>Fréquence</label>
        <div className="view-toggle" style={{ marginBottom: 14 }}>
          <span className={freqMode === "daily" ? "active" : ""} onClick={() => setFreqMode("daily")}>
            Quotidien
          </span>
          <span className={freqMode === "custom" ? "active" : ""} onClick={() => setFreqMode("custom")}>
            Jours choisis
          </span>
        </div>

        {freqMode === "custom" && (
          <div className="day-picker-row">
            {DAYS.map((d) => (
              <span
                key={d.key}
                className={`day-picker-circle ${selectedDays.includes(d.key) ? "selected" : ""}`}
                onClick={() => toggleDay(d.key)}
              >
                {d.label}
              </span>
            ))}
          </div>
        )}

        <div className="detail-form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/")}>
            Annuler
          </button>
          <button type="submit" className="btn-confirm">
            Créer l'habitude
          </button>
        </div>
      </form>
    </div>
  );
}


export default HabitNew;