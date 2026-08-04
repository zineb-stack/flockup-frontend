import { useState, useEffect } from "react";
import { getHabits, logHabit, getUser, getHabitCalendar, updateHabit, deleteHabit, getCurrentUserId } from "../services/api";
import {
  IconCircleCheck, IconCircle, IconEdit, IconTrash, IconCalendarStats,
  IconBook, IconRun, IconHeart, IconBrain, IconTarget, IconCoin,
  IconSchool, IconMoon, IconApple, IconUsers, IconPaletteFill, IconFlag,
} from "../components/Icons";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bonjour";
  if (h < 18) return "Bon après-midi";
  return "Bonsoir";
}

const CATEGORY_ICONS = {
  lecture: IconBook,
  sport: IconRun,
  "santé": IconHeart,
  "méditation": IconBrain,
  "productivité": IconTarget,
  finance: IconCoin,
  apprentissage: IconSchool,
  sommeil: IconMoon,
  alimentation: IconApple,
  social: IconUsers,
  "créativité": IconPaletteFill,
};

function getIconComponent(category) {
  return CATEGORY_ICONS[(category || "").toLowerCase()] || IconFlag;
}

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function HabitRow({ habit, onLog, onUpdated }) {
  const [logsMap, setLogsMap] = useState({});
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(habit.title);

  useEffect(() => {
    loadLogs();
  }, [habit.id]);

  async function loadLogs() {
    try {
      const res = await getHabitCalendar(habit.id, today.getFullYear(), today.getMonth() + 1);
      const map = {};
      res.data.forEach((l) => { map[l.date] = l.completed; });
      setLogsMap(map);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSave() {
    if (!editTitle.trim()) return;
    try {
      await updateHabit(habit.id, { title: editTitle });
      setEditing(false);
      onUpdated();
    } catch (err) {
      alert("Erreur lors de la mise à jour");
    }
  }

  async function handleDelete() {
    if (!confirm(`Supprimer "${habit.title}" ?`)) return;
    try {
      await deleteHabit(habit.id);
      onUpdated();
    } catch (err) {
      alert("Erreur lors de la suppression");
    }
  }

  const monday = new Date(today);
  const dayIdx = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dayIdx);

  const weekDays = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  const doneToday = logsMap[todayStr] === true;
  const isDanger = habit.streak_count === 0;

  if (editing) {
    return (
      <div className="habit-row habit-row-editing">
        <input
          className="habit-edit-input"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          autoFocus
        />
        <button className="btn-icon-save" onClick={handleSave}>✓</button>
        <button className="btn-icon-cancel" onClick={() => setEditing(false)}>✕</button>
        <button className="btn-icon-delete" onClick={handleDelete}><IconTrash size={16} /></button>
      </div>
    );
  }

  return (
    <div className="habit-row">
      <div className={`habit-icon-box ${isDanger ? "danger" : "success"}`}>
        {(() => {
          const CatIcon = getIconComponent(habit.category);
          return <CatIcon size={19} />;
        })()}
      </div>

      <div className="habit-row-main">
        <div className="habit-row-top">
          <span className="habit-row-title">{habit.title}</span>
          <span className={`habit-row-streak ${isDanger ? "danger" : "warning"}`}>
            {habit.streak_count} {habit.streak_count === 1 ? "jour" : "jours"}
          </span>
        </div>
        <div className="week-mini-bar">
          {weekDays.map((d) => {
            const dateStr = toDateStr(d);
            let cls = "future";
            if (dateStr <= todayStr) {
              cls = logsMap[dateStr] ? "done" : "missed";
            }
            return <div key={dateStr} className={`week-mini-seg ${cls}`} />;
          })}
        </div>
      </div>

      <span
        className={`check-toggle ${doneToday ? "checked" : ""}`}
        onClick={() => !doneToday && onLog(habit.id)}
      >
        {doneToday ? <IconCircleCheck size={26} /> : <IconCircle size={26} />}
      </span>
      <span className="btn-icon-edit" onClick={() => setEditing(true)}>
        <IconEdit size={15} />
      </span>
    </div>
  );
}

function Home() {
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const userId = getCurrentUserId();

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [habitsRes, userRes] = await Promise.all([
        getHabits(userId),
        getUser(userId),
      ]);
      setHabits(habitsRes.data.filter((h) => h.title !== "string"));
      setUser(userRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLog(habitId) {
    try {
      await logHabit(habitId, true);
      loadAll();
    } catch (err) {
      alert(err.response?.data?.detail || "Erreur");
    }
  }

  if (loading) return <div className="page"><p>Chargement...</p></div>;

  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak_count || 0), 0);

  return (
    <div className="page">
      <div className="home-header-row">
        <div className="home-header">
          <div className="home-avatar">{user?.avatar_url || "🙂"}</div>
          <div>
            <p className="greeting">{getGreeting()}, {user?.name?.split(" ")[0]}</p>
            <p className="greeting-sub">
              {today.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
        </div>

        <div className="mini-stats">
          <div className="mini-stat-box">
            <p className="mini-stat-value">{habits.length}</p>
            <p className="mini-stat-label">Habitudes</p>
          </div>
          <div className="mini-stat-box">
            <p className="mini-stat-value warning">{bestStreak}</p>
            <p className="mini-stat-label">Meilleur streak</p>
          </div>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title-row">
          <span className="section-title-icon"><IconCalendarStats size={18} /></span>
          <span className="section-title">Mon Habit Tracker</span>
        </div>
        <div className="section-underline" />
        <p className="section-subtitle">Reste régulier, jour après jour</p>
      </div>

      {habits.length === 0 && <p className="empty-state">Aucune habitude pour le moment.</p>}

      {habits.map((habit) => (
        <HabitRow key={habit.id} habit={habit} onLog={handleLog} onUpdated={loadAll} />
      ))}
    </div>
  );
}

export default Home;