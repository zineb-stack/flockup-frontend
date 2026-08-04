import { useState } from "react";
import { useNavigate } from "react-router-dom";

function FloatingAddButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleOptionClick(type) {
    setOpen(false);
    if (type === "task") {
      navigate("/tasks/new");
    } else if (type === "channel") {
      navigate("/channels?create=1");
    } else if (type === "habit") {
      navigate("/habits/new");
    }
  }

  return (
    <>
      <button className="fab" onClick={() => setOpen(!open)}>
        {open ? "×" : "+"}
      </button>

      {open && (
        <div className="fab-menu">
          <button className="fab-option" onClick={() => handleOptionClick("task")}>
            Nouvelle tâche
          </button>
          <button className="fab-option" onClick={() => handleOptionClick("habit")}>
            Nouvelle habitude
          </button>
          <button className="fab-option" onClick={() => handleOptionClick("channel")}>
            Nouveau channel
          </button>
        </div>
      )}

      {open && <div className="fab-overlay" onClick={() => setOpen(false)} />}
    </>
  );
}

export default FloatingAddButton;