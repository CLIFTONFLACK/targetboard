import { CalendarDays, KanbanSquare, LayoutDashboard, Settings, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ role, setRole }) {
  return (
    <aside className="sidebar">
      <div className="brand-mark">
        <div className="logo-box">TB</div>
        <div>
          <strong>TargetBoard</strong>
          <span>Content Agent</span>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to}>
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <label className="role-switcher">
        <span>
          <ShieldCheck size={16} />
          Reviewer role
        </span>
        <select value={role} onChange={(event) => setRole(event.target.value)}>
          <option>VP Brand</option>
          <option>VP Product</option>
          <option>CEO</option>
        </select>
      </label>
    </aside>
  );
}
