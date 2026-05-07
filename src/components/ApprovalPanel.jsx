import { Check, Circle, Lock, X } from "lucide-react";

const iconByStatus = {
  Approved: Check,
  Pending: Circle,
  Locked: Lock,
  Rejected: X,
  "Needs Edit": Circle,
};

export default function ApprovalPanel({ approvals }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Approval Stages</h2>
      </div>
      <div className="approval-list">
        {approvals.map((approval) => {
          const Icon = iconByStatus[approval.status] || Circle;
          return (
            <div className="approval-row" key={approval.stage}>
              <div className={`approval-icon ${approval.status.toLowerCase().replace(/\s+/g, "-")}`}>
                <Icon size={15} />
              </div>
              <div>
                <strong>Stage {approval.stage}: {approval.role}</strong>
                <span>{approval.reviewer}</span>
              </div>
              <div className="approval-meta">
                <b>{approval.status}</b>
                {approval.timestamp ? <span>{new Date(approval.timestamp).toLocaleDateString()}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
