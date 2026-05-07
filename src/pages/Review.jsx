import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import ApprovalPanel from "../components/ApprovalPanel.jsx";
import AssetCard from "../components/AssetCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { getCurrentReviewStage } from "../utils/statusHelpers.js";

export default function Review({ posts, role, onApproval, onAssetSave, onRegenerate, onSchedule }) {
  const { id } = useParams();
  const post = posts.find((item) => item.id === id);
  const [note, setNote] = useState("");
  const [schedule, setSchedule] = useState({
    publishMode: "Manual",
    scheduledDate: "",
    channel: "LinkedIn",
  });

  const activeStage = useMemo(() => (post ? getCurrentReviewStage(post) : null), [post]);

  if (!post) {
    return (
      <section className="panel">
        <h2>Post not found</h2>
        <Link to="/pipeline">Back to pipeline</Link>
      </section>
    );
  }

  const sortedAssets = [...post.assets].sort((a, b) => b.score - a.score);
  const canAct = activeStage?.role === role;
  const stageThreeApproved = post.approvals[2]?.status === "Approved";

  return (
    <div className="review-layout">
      <section className="review-main page-stack">
        <article className="panel blog-header-panel">
          <div>
            <div className="header-row">
              <StatusBadge status={post.status} />
              <span>{post.publishDate}</span>
              <span>{post.category}</span>
              <span>{post.audienceTag}</span>
            </div>
            <h2>{post.title}</h2>
            <a href={post.url} target="_blank" rel="noreferrer">
              {post.url}
              <ExternalLink size={14} />
            </a>
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Content brief</p>
              <h2>{post.selectedAngle || "Angle not selected"}</h2>
            </div>
          </div>
          <p className="summary-text">{post.execSummary}</p>
          <div className="brief-grid">
            <div>
              <h3>Suggested angles</h3>
              {post.suggestedAngles.length ? (
                post.suggestedAngles.map((angle) => (
                  <p key={angle.angle}>
                    <strong>{angle.angle}</strong>
                    <span>{angle.reason}</span>
                  </p>
                ))
              ) : (
                <p>Awaiting extractor output.</p>
              )}
            </div>
            <div>
              <h3>Key takeaways</h3>
              <ul>
                {post.takeaways.map((takeaway) => (
                  <li key={takeaway}>{takeaway}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Newsletter blurb</h3>
              <p>{post.newsletterBlurb || "Not generated yet."}</p>
            </div>
            <div>
              <h3>CTA</h3>
              <p>{post.cta || "Not selected yet."}</p>
            </div>
          </div>
        </article>

        <section className="asset-stack">
          {sortedAssets.length ? (
            sortedAssets.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onSave={(assetId, copy) => onAssetSave(post.id, assetId, copy)}
                onRegenerate={(assetId, notes) => onRegenerate(post.id, assetId, notes)}
              />
            ))
          ) : (
            <article className="panel">
              <h2>No generated assets yet</h2>
              <p className="empty-state">Run the agent from the Pipeline page to create the first content menu.</p>
            </article>
          )}
        </section>
      </section>

      <aside className="review-side page-stack">
        <ApprovalPanel approvals={post.approvals} />
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Current stage</p>
              <h2>{activeStage ? activeStage.role : "Complete"}</h2>
            </div>
          </div>
          {canAct ? (
            <div className="approval-actions">
              <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Reviewer notes" rows={4} />
              <button className="primary-button" type="button" onClick={() => onApproval(post.id, "Approved", note)}>
                Approve
              </button>
              <button className="secondary-button" type="button" onClick={() => onApproval(post.id, "Needs Edit", note)}>
                Needs Edit
              </button>
              <button className="danger-button" type="button" onClick={() => onApproval(post.id, "Rejected", note)}>
                Reject
              </button>
            </div>
          ) : (
            <p className="empty-state">
              {activeStage ? `Waiting on ${activeStage.role}.` : "All approval stages are complete."}
            </p>
          )}
        </section>

        {stageThreeApproved ? (
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Scheduling</p>
                <h2>Publish handoff</h2>
              </div>
            </div>
            <div className="schedule-form">
              <label>
                <span>Publish mode</span>
                <select value={schedule.publishMode} onChange={(event) => setSchedule({ ...schedule, publishMode: event.target.value })}>
                  <option>Manual</option>
                  <option>Auto-post</option>
                </select>
              </label>
              <label>
                <span>Scheduled date</span>
                <input type="date" value={schedule.scheduledDate} onChange={(event) => setSchedule({ ...schedule, scheduledDate: event.target.value })} />
              </label>
              <label>
                <span>Channel</span>
                <select value={schedule.channel} onChange={(event) => setSchedule({ ...schedule, channel: event.target.value })}>
                  <option>LinkedIn</option>
                  <option>Newsletter</option>
                  <option>Both</option>
                </select>
              </label>
              <button className="primary-button" type="button" onClick={() => onSchedule(post.id, schedule)}>
                Save schedule
              </button>
            </div>
          </section>
        ) : null}
      </aside>
    </div>
  );
}
