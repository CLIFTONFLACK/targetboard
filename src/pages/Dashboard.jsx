import { Link } from "react-router-dom";
import { ArrowRight, Newspaper, TimerReset } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import { assembleNewsletterDraft } from "../utils/newsletter.js";
import { getPendingActionsForRole, groupPostsByStatus, isOverdue, statusOrder } from "../utils/statusHelpers.js";

export default function Dashboard({ posts, role, activities }) {
  const grouped = groupPostsByStatus(posts);
  const pending = getPendingActionsForRole(posts, role);
  const overdue = posts.filter(isOverdue);
  const newsletter = assembleNewsletterDraft(posts, "May 2026");

  return (
    <div className="page-stack">
      <section className="status-strip">
        {statusOrder.filter((status) => !["Needs Edit", "Rejected"].includes(status)).map((status) => (
          <Link key={status} to={`/pipeline?status=${encodeURIComponent(status)}`}>
            <span>{status}</span>
            <strong>{grouped[status].length}</strong>
          </Link>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel action-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">My pending actions</p>
              <h2>{role}</h2>
            </div>
            <span className="count-pill">{pending.length}</span>
          </div>
          <div className="compact-list">
            {pending.length ? (
              pending.map((post) => (
                <Link key={post.id} to={`/review/${post.id}`}>
                  <div>
                    <strong>{post.title}</strong>
                    <span>{post.selectedAngle || "Angle confirmation needed"}</span>
                  </div>
                  <ArrowRight size={17} />
                </Link>
              ))
            ) : (
              <p className="empty-state">No items are waiting on this reviewer.</p>
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Overdue</p>
              <h2>Review risk</h2>
            </div>
            <TimerReset size={20} />
          </div>
          <div className="compact-list">
            {overdue.map((post) => (
              <Link key={post.id} to={`/review/${post.id}`}>
                <div>
                  <strong>{post.title}</strong>
                  <span>{post.daysInStatus} business days in {post.status}</span>
                </div>
                <StatusBadge status={post.status} />
              </Link>
            ))}
          </div>
        </article>

        <article className="panel newsletter-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Newsletter</p>
              <h2>{newsletter.month} draft</h2>
            </div>
            <Newspaper size={20} />
          </div>
          {newsletter.featuredArticle ? (
            <>
              <div className="featured-newsletter">
                <span>Featured</span>
                <strong>{newsletter.featuredArticle.title}</strong>
                <p>{newsletter.featuredArticle.blurb}</p>
              </div>
              <div className="subject-lines">
                {newsletter.subjectLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </div>
            </>
          ) : (
            <p className="empty-state">No newsletter-ready blurbs yet.</p>
          )}
        </article>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Recommended assets</p>
            <h2>Top publishing candidates</h2>
          </div>
        </div>
        <div className="recommendation-table">
          {posts
            .filter((post) => post.assets.some((asset) => asset.recommendation))
            .map((post) => {
              const asset = [...post.assets].sort((a, b) => b.score - a.score)[0];
              return (
                <Link key={post.id} to={`/review/${post.id}`} className="recommendation-row">
                  <div>
                    <strong>{post.title}</strong>
                    <span>{asset.type} · {asset.recommendationReason}</span>
                  </div>
                  <ScoreBar score={asset.score} />
                  <StatusBadge status={post.status} />
                </Link>
              );
            })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="section-label">Activity Log</p>
            <h2>Recent changes</h2>
          </div>
        </div>
        <div className="activity-list inline">
          {activities.slice(0, 6).map((activity) => (
            <article key={activity.id}>
              <strong>{activity.action}</strong>
              <span>{activity.title}</span>
              <small>{activity.actor} · {new Date(activity.timestamp).toLocaleString()}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
