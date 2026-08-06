import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  IconHome, IconNotebook, IconMessages, IconUser,
  IconCrown, IconClock, IconPalette, IconMail, IconSettings,
  IconMenu, IconFlockUpLogo,
} from "./Icons";
import { getPendingCount, getCurrentUserId } from "../services/api";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    getPendingCount(getCurrentUserId())
      .then((res) => setPendingCount(res.data.count))
      .catch(() => {});
  }, []);

  const mainItems = [
    { to: "/", Icon: IconHome, label: "Accueil" },
    { to: "/tasks", Icon: IconNotebook, label: "Tâches" },
    { to: "/channels", Icon: IconMessages, label: "Channels" },
    { to: "/profile", Icon: IconUser, label: "Profil" },
  ];

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        <div className="logo-badge">
          <IconFlockUpLogo size={16} />
        </div>
        {!collapsed && <span>FlockUp</span>}
      </div>
      <div className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
        <IconMenu size={18} />
      </div>

      {mainItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
        >
          <span className="sidebar-icon-wrap">
            <item.Icon size={18} />
            {item.to === "/channels" && pendingCount > 0 && (
              <span className="sidebar-badge">{pendingCount}</span>
            )}
          </span>
          {!collapsed && <span className="sidebar-label">{item.label}</span>}
        </NavLink>
      ))}

      <div className="sidebar-divider" />

      <div className="sidebar-item" onClick={() => navigate("/pro")}>
        <IconCrown size={18} />
        {!collapsed && <span className="sidebar-label">Passer à Pro</span>}
      </div>

      <div className="sidebar-item" onClick={() => navigate("/pomodoro")}>
        <IconClock size={18} />
        {!collapsed && <span className="sidebar-label">Pomodoro</span>}
      </div>

      <div className="sidebar-item" onClick={() => navigate("/settings?view=contact")}>
        <IconMail size={18} />
        {!collapsed && <span className="sidebar-label">Contactez-nous</span>}
      </div>

      <NavLink to="/settings" className={({ isActive }) => `sidebar-item sidebar-bottom ${isActive ? "active" : ""}`}>
        <IconSettings size={18} />
        {!collapsed && <span className="sidebar-label">Paramètres</span>}
      </NavLink>
    </aside>
  );
}

export default Sidebar;