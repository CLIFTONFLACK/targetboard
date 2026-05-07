import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge.jsx";
import { isOverdue } from "../utils/statusHelpers.js";

export default function Calendar({ posts }) {
  const scheduled = posts.filter((post) => post.scheduledDate);
  const published = posts.filter((post) => post.status === "Published");
  const overdue = posts.filter(isOverdue);
  const upcomingBlogs = posts.filter((post) => post.status === "New");

  return (
    <div className="page-stack">
      <section className="calendar-grid">
        <CalendarLane title="Scheduled posts" items={scheduled} tone="blue" />
        <CalendarLane title="Published posts" items={published} tone="green" />
        <CalendarLane title="Upcoming blog rows" items={upcomingBlogs} tone="purple" />
        <CalendarLane title="Overdue reviews" items={overdue} tone="red" />
      </section>
    </div>
  );
}

function CalendarLane({ title, items, tone }) {
  return (
    <section className="panel calendar-lane">
      <div className="panel-header">
        <div>
          <p className="section-label">{title}</p>
          <h2>{items.length}</h2>
        </div>
      </div>
      <div className="calendar-items">
        {items.length ? (
          items.map((post) => (
            <Link key={`${title}-${post.id}`} to={`/review/${post.id}`} className={`calendar-item ${tone}`}>
              <span>{post.scheduledDate || post.publishDate}</span>
              <strong>{post.title}</strong>
              <StatusBadge status={post.status} />
            </Link>
          ))
        ) : (
          <p className="empty-state">No entries in this lane.</p>
        )}
      </div>
    </section>
  );
}
