import { X } from "lucide-react";

export default function NotificationDrawer({ open, onClose, activities, role }) {
  return (
    <aside className={`drawer ${open ? "open" : ""}`} aria-hidden={!open}>
      <div className="drawer-header">
        <div>
          <p className="section-label">{role}</p>
          <h2>Notifications</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="activity-list">
        {activities.slice(0, 12).map((item) => (
          <article key={item.id}>
            <strong>{item.action}</strong>
            <span>{item.title}</span>
            <small>{item.actor} · {new Date(item.timestamp).toLocaleString()}</small>
          </article>
        ))}
      </div>
    </aside>
  );
}
