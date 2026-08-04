import { useState, useEffect } from "react";
import { getHabits, getMyChannels, getUser, updateUser, getPredict, getHabitCalendar, getCurrentUserId } from "../services/api";

const AVATAR_OPTIONS = ["🦊", "🐱", "🐼", "🐨", "🦁", "🐸", "🐧", "🦄", "🐻", "🐰"];
const DAY_LABELS_SHORT = ["D", "L", "M", "M", "J", "V", "S"];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function HabitHistoryChart({ habit }) {
  const [logsMap, setLogsMap] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadLogs();
  }, [habit.id]);

  async function loadLogs() {
    const today = new Date();
    try {
      const res = await getHabitCalendar(habit.id, today.getFullYear(), today.getMonth() + 1);
      const map = {};
      res.data.forEach((l) => { map[l.date] = l.completed; });

      const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const resPrev = await getHabitCalendar(habit.id, prevMonth.getFullYear(), prevMonth.getMonth() + 1);
      resPrev.data.forEach((l) => { map[l.date] = l.completed; });

      setLogsMap(map);
    } catch (err) {
      console.error(err);
    } finally {
      setLoaded(true);
    }
  }

  const today = new Date();
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    last7.push(d);
  }

  const completedCount = last7.filter((d) => logsMap[toDateStr(d)]).length;

  if (!loaded) return null;

  return (
    <div className="chart-card">
      <p className="chart-card-title">{habit.title} — 7 derniers jours</p>

      <div className="chart-with-axis">
        <div className="chart-y-axis">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <div className="chart-bars">
          {last7.map((d) => {
            const dateStr = toDateStr(d);
            const done = logsMap[dateStr];
            const height = dateStr in logsMap ? (done ? 100 : 15) : 0;
            return (
              <div key={dateStr} className="chart-bar-col">
                <div
                  className={`chart-bar ${done ? "done" : dateStr in logsMap ? "missed" : "empty"}`}
                  style={{ height: `${height}%` }}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="chart-x-labels">
        {last7.map((d, i) => (
          <span key={i} className={i === 6 ? "today" : ""}>{DAY_LABELS_SHORT[d.getDay()]}</span>
        ))}
      </div>

      <div className="insight-row">
        <span className="insight-text">
          Tu réussis {completedCount} jour{completedCount > 1 ? "s" : ""} sur 7 en moyenne
          {completedCount >= 5 ? " — continue comme ça !" : completedCount >= 3 ? "." : " — essaie de faire mieux cette semaine."}
        </span>
      </div>
    </div>
  );
}

function Profile() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [channels, setChannels] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [userRes, habitsRes, channelsRes] = await Promise.all([
        getUser(userId),
        getHabits(userId),
        getMyChannels(userId),
      ]);
      setUser(userRes.data);
      setNameInput(userRes.data.name);
      const cleanHabits = habitsRes.data.filter((h) => h.title !== "string");
      setHabits(cleanHabits);
      setChannels(channelsRes.data);

      cleanHabits.forEach(async (habit) => {
        try {
          const predRes = await getPredict(habit.id);
          if (predRes.data.success_probability !== null) {
            setPredictions((prev) => ({ ...prev, [habit.id]: predRes.data.success_probability }));
          }
        } catch (err) {
          console.error(err);
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAvatarSelect(emoji) {
    try {
      const res = await updateUser(userId, { avatar_url: emoji });
      setUser(res.data);
      setShowAvatarPicker(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  }

  async function handleNameSave() {
    if (!nameInput.trim()) return;
    try {
      const res = await updateUser(userId, { name: nameInput });
      setUser(res.data);
      setEditingName(false);
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  }

  if (loading || !user) return <div className="page"><p>Chargement...</p></div>;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.best_streak || h.streak_count || 0), 0);

  return (
    <div className="page">
      <div className="profile-header">
        <div className="avatar-circle" onClick={() => setShowAvatarPicker(true)}>
          {user.avatar_url || "🙂"}
          <span className="avatar-edit-badge">✎</span>
        </div>

        {editingName ? (
          <div className="name-edit-row">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNameSave()}
              autoFocus
            />
            <button onClick={handleNameSave}>OK</button>
          </div>
        ) : (
          <p className="profile-name" onClick={() => setEditingName(true)}>
            {user.name} <span className="edit-icon">✎</span>
          </p>
        )}

        <p className="profile-sub">
          Membre depuis {new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
        </p>
      </div>

      {showAvatarPicker && (
        <div className="avatar-picker">
          {AVATAR_OPTIONS.map((emoji) => (
            <span key={emoji} className="avatar-option" onClick={() => handleAvatarSelect(emoji)}>
              {emoji}
            </span>
          ))}
        </div>
      )}

      <div className="stats-row">
        <div className="stat-box">
          <p className="stat-value">{bestStreak}</p>
          <p className="stat-label">Meilleur streak</p>
        </div>
        <div className="stat-box">
          <p className="stat-value">{habits.length}</p>
          <p className="stat-label">Habitudes</p>
        </div>
        <div className="stat-box">
          <p className="stat-value">{channels.length}</p>
          <p className="stat-label">Channels</p>
        </div>
      </div>


      <p className="section-label" style={{ marginTop: 24 }}>Historique & Analyse</p>
      {habits.map((h) => (
        <HabitHistoryChart key={h.id} habit={h} />
      ))}

      <p className="section-label" style={{ marginTop: 24 }}>Prédictions IA</p>
      {habits.length === 0 && <p className="empty-state">Aucune prédiction disponible.</p>}
      {habits.map((h) => {
        const proba = predictions[h.id];
        if (proba === undefined) return null;
        const percent = Math.round(proba * 100);
        const level = percent >= 60 ? "success" : percent >= 35 ? "warning" : "danger";
        return (
          <div key={h.id} className="prediction-card">
            <div className="prediction-top">
              <span className="prediction-title">{h.title}</span>
              <span className={`prediction-percent ${level}`}>{percent}%</span>
            </div>
            <div className="predict-bar">
              <div className={`predict-fill-colored ${level}`} style={{ width: `${percent}%` }} />
            </div>
            <p className="prediction-caption">Chance de réussite aujourd'hui</p>
          </div>
        );
      })}

      <div className="pro-banner">
        <span>Passer à Pro</span>
        <span className="chevron">›</span>
      </div>
    </div>
  );
}

export default Profile;