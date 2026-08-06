import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconCrown, IconClock, IconMail, IconSettings } from "./Icons";

const ITEMS = [
  { to: "/pro", Icon: IconCrown, label: "Passer à Pro" },
  { to: "/pomodoro", Icon: IconClock, label: "Pomodoro" },
  { to: "/settings?view=contact", Icon: IconMail, label: "Feedback" },
  { to: "/settings", Icon: IconSettings, label: "Paramètres" },
];

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  function handleSelect(to) {
    setOpen(false);
    navigate(to);
  }

  return (
    <>
      <div className={open ? "active" : ""} onClick={() => setOpen(!open)}>
        <span className="nav-icon">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
          </svg>
        </span>
        <span className="nav-label">Plus</span>
      </div>

      {open && (
        <>
          <div className="more-menu-overlay" onClick={() => setOpen(false)} />
          <div className="more-menu-popup">
            {ITEMS.map((item) => (
              <div key={item.to} className="more-menu-item" onClick={() => handleSelect(item.to)}>
                <item.Icon size={18} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default MoreMenu;