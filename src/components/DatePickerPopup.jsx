import { useState } from "react";

const MONTH_NAMES = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];
const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DatePickerPopup({ selectedDate, onSelect, onClose }) {
  const initial = new Date(selectedDate + "T00:00:00");
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  }

  function handlePick(day) {
    const picked = new Date(viewYear, viewMonth, day);
    onSelect(toDateStr(picked));
    onClose();
  }

  return (
    <div className="datepicker-overlay" onClick={onClose}>
      <div className="datepicker-popup" onClick={(e) => e.stopPropagation()}>
        <div className="datepicker-header">
          <span className="datepicker-nav" onClick={prevMonth}>‹</span>
          <span className="datepicker-title">{MONTH_NAMES[viewMonth]} {viewYear}</span>
          <span className="datepicker-nav" onClick={nextMonth}>›</span>
        </div>

        <div className="datepicker-daylabels">
          {DAY_LABELS.map((l, i) => <span key={i}>{l}</span>)}
        </div>

        <div className="datepicker-grid">
          {cells.map((day, i) => {
            if (day === null) return <span key={i} className="datepicker-cell empty" />;
            const dateStr = toDateStr(new Date(viewYear, viewMonth, day));
            const isSelected = dateStr === selectedDate;
            return (
              <span
                key={i}
                className={`datepicker-cell ${isSelected ? "selected" : ""}`}
                onClick={() => handlePick(day)}
              >
                {day}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default DatePickerPopup;