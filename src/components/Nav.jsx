import { NavLink } from "react-router-dom";
import { IconHome, IconNotebook, IconMessages, IconUser } from "./Icons";
import MoreMenu from "./MoreMenu";

const ITEMS = [
  { to: "/", end: true, Icon: IconHome, label: "Accueil" },
  { to: "/tasks", end: false, Icon: IconNotebook, label: "Tâches" },
  { to: "/channels", end: false, Icon: IconMessages, label: "Channels" },
  { to: "/profile", end: false, Icon: IconUser, label: "Profil" },
];

function Nav() {
  return (
    <nav className="navbar">
      {ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          <span className="nav-icon"><item.Icon size={19} /></span>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}
      <MoreMenu />
    </nav>
  );
}

export default Nav;