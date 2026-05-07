export default function StatusBadge({ status }) {
  const className = `status-badge ${status.toLowerCase().replace(/\s+/g, "-")}`;
  return <span className={className}>{status}</span>;
}
