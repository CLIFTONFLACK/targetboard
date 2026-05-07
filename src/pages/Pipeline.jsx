import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Play, Plus } from "lucide-react";
import StatusBadge from "../components/StatusBadge.jsx";
import ScoreBar from "../components/ScoreBar.jsx";
import { groupPostsByStatus, isOverdue, statusOrder } from "../utils/statusHelpers.js";

export default function Pipeline({ posts, onAddPost, onRunAgent }) {
  const [params, setParams] = useSearchParams();
  const [url, setUrl] = useState("");
  const selectedStatus = params.get("status") || "All";
  const grouped = useMemo(() => groupPostsByStatus(posts), [posts]);

  function submit(event) {
    event.preventDefault();
    if (!url.trim()) return;
    onAddPost(url.trim());
    setUrl("");
  }

  return (
    <div className="page-stack">
      <section className="pipeline-filter">
        <form className="manual-url-form" onSubmit={submit}>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://targetboard.ai/blog/new-article"
          />
          <button className="primary-button" type="submit">
            <Plus size={16} />
            Add URL
          </button>
        </form>
        <select value={selectedStatus} onChange={(event) => setParams(event.target.value === "All" ? {} : { status: event.target.value })}>
          <option>All</option>
          {statusOrder.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </section>

      <section className="kanban-board">
        {statusOrder
          .filter((status) => selectedStatus === "All" || status === selectedStatus)
          .map((status) => (
            <div className="kanban-column" key={status}>
              <header>
                <span>{status}</span>
                <strong>{grouped[status].length}</strong>
              </header>
              <div className="kanban-card-list">
                {grouped[status].map((post) => {
                  const topAsset = [...post.assets].sort((a, b) => b.score - a.score)[0];
                  return (
                    <article className={`kanban-card ${isOverdue(post) ? "overdue" : ""}`} key={post.id}>
                      <div className="kanban-card-header">
                        <StatusBadge status={post.status} />
                        {isOverdue(post) ? <span className="overdue-flag">Overdue</span> : null}
                      </div>
                      <Link to={`/review/${post.id}`}>
                        <strong>{post.title}</strong>
                      </Link>
                      <p>{post.selectedAngle || "Awaiting angle and extraction"}</p>
                      {topAsset ? <ScoreBar score={topAsset.score} /> : null}
                      <div className="approval-dots" aria-label="Approval progress">
                        {post.approvals.map((approval) => (
                          <span key={approval.stage} className={approval.status.toLowerCase().replace(/\s+/g, "-")} />
                        ))}
                      </div>
                      <footer>
                        <span>{post.daysInStatus}d in status</span>
                        {post.status === "New" ? (
                          <button className="mini-icon-button" type="button" onClick={() => onRunAgent(post.id)}>
                            <Play size={14} />
                            Run agent
                          </button>
                        ) : (
                          <Link to={`/review/${post.id}`}>Open</Link>
                        )}
                      </footer>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
      </section>
    </div>
  );
}
