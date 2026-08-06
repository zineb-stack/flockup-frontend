import { useState, useEffect } from "react";
import { getTasksByDate, toggleTask, deleteTask, getCurrentUserId } from "../services/api";
import { IconCalendarStats, IconCheckSquare } from "../components/Icons";
import DatePickerPopup from "../components/DatePickerPopup";

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const todayObj = new Date();
const todayStr = toDateStr(todayObj);

function buildDateRange(centerDate) {
  const days = [];
  for (let i = -7; i <= 7; i++) {
    const d = new Date(centerDate);
    d.setDate(centerDate.getDate() + i);
    days.push(d);
  }
  return days;
}

function Tasks() {
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(buildDateRange(todayObj));
  const [showPicker, setShowPicker] = useState(false);
  const userId = getCurrentUserId();

  useEffect(() => {
    loadTasks();
  }, [selectedDate]);

  async function loadTasks() {
    setLoading(true);
    try {
      const res = await getTasksByDate(userId, selectedDate);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle(taskId) {
    try {
      await toggleTask(taskId);
      loadTasks();
    } catch (err) {
      alert("Erreur");
    }
  }

  async function handleDelete(e, taskId) {
    e.stopPropagation();
    if (!confirm("Supprimer cette tâche ?")) return;
    try {
      await deleteTask(taskId);
      loadTasks();
    } catch (err) {
      alert("Erreur");
    }
  }

  function handlePickDate(picked) {
    setSelectedDate(picked);
    const centerDate = new Date(picked + "T00:00:00");
    setDateRange(buildDateRange(centerDate));
  }

  const selectedDateObj = new Date(selectedDate + "T00:00:00");
  const doneCount = tasks.filter((t) => t.done).length;
  const priorityColor = { high: "danger", normal: "warning", low: "neutral" };

  return (
    <div className="page">
      <div className="tasks-header-row">
        <div className="section-header">
          <div className="section-title-row">
            <span className="section-title-icon"><IconCheckSquare size={18} /></span>
            <span className="section-title">Mes tâches</span>
          </div>
          <div className="section-underline" />
        </div>

        <div className="calendar-pick-btn" onClick={() => setShowPicker(true)}>
          <IconCalendarStats size={17} />
        </div>
      </div>

      <div className="date-scroller">
        {dateRange.map((d) => {
          const dStr = toDateStr(d);
          const isSelected = dStr === selectedDate;
          return (
            <div
              key={dStr}
              className={`date-chip ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDate(dStr)}
            >
              <p className="date-chip-day">{DAY_LABELS[d.getDay()]}</p>
              <p className="date-chip-num">{d.getDate()}</p>
            </div>
          );
        })}
      </div>

      <div className="selected-date-row">
        <p className="selected-date-label">
          {selectedDateObj.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {tasks.length > 0 && (
          <span className="mini-stat-inline">{doneCount}/{tasks.length} terminées</span>
        )}
      </div>

      {loading && <p className="empty-state">Chargement...</p>}
      {!loading && tasks.length === 0 && (
        <p className="empty-state">Aucune tâche pour ce jour.</p>
      )}

      {tasks.map((task) => (
        <div
          key={task.id}
          className={`task-row-pro priority-${priorityColor[task.priority] || "neutral"} ${task.done ? "done" : ""}`}
          onClick={() => handleToggle(task.id)}
        >
          <div className={`checkbox-pro ${task.done ? "checked" : ""}`}>
            {task.done && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            )}
          </div>
          <div className="task-row-pro-text">
            <p className={`task-row-pro-title ${task.done ? "done" : ""}`}>{task.title}</p>
            <p className="task-row-pro-meta">
              {task.priority === "high" && "Priorité haute"}
              {task.priority === "normal" && "Priorité normale"}
              {task.priority === "low" && "Priorité basse"}
            </p>
          </div>
          <span className="task-delete-btn" onClick={(e) => handleDelete(e, task.id)}>🗑</span>
        </div>
      ))}

      {showPicker && (
        <DatePickerPopup
          selectedDate={selectedDate}
          onSelect={handlePickDate}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  );
}

export default Tasks;