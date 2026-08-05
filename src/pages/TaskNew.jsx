import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTask, getCurrentUserId } from "../services/api";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function TaskNew() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    due_date: toDateStr(new Date()),
    priority: "normal",
  });
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      await createTask(getCurrentUserId(), {
        title: form.title,
        description: form.description || null,
        due_date: form.due_date || null,
        priority: form.priority,
      });
      navigate("/tasks");
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur lors de la création");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Nouvelle tâche</h1>
      </div>

      <form onSubmit={handleSubmit} className="detail-form">
        <label>Titre</label>
        <input
          placeholder="Ex: Préparer le cours"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          autoFocus
          required
        />

        <label>Description (optionnel)</label>
        <textarea
          placeholder="Détails supplémentaires..."
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
        />

        <label>Date d'échéance</label>
        <input
          type="date"
          value={form.due_date}
          onChange={(e) => setForm({ ...form, due_date: e.target.value })}
        />

        <label>Priorité</label>
        <div className="priority-select">
          {["low", "normal", "high"].map((p) => (
            <span
              key={p}
              className={`priority-pill ${form.priority === p ? "active" : ""}`}
              onClick={() => setForm({ ...form, priority: p })}
            >
              {p === "low" && "Basse"}
              {p === "normal" && "Normale"}
              {p === "high" && "Haute"}
            </span>
          ))}
        </div>

        <div className="detail-form-actions">
          <button type="button" className="btn-cancel" onClick={() => navigate("/tasks")}>
            Annuler
          </button>
          <button type="submit" className="btn-confirm">
            Créer la tâche
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskNew;
