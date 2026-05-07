export const statusOrder = [
  "New",
  "Processing",
  "Ready for Review",
  "Pending Approval",
  "Approved",
  "Needs Edit",
  "Rejected",
  "Scheduled",
  "Published",
];

export function groupPostsByStatus(posts) {
  return statusOrder.reduce((groups, status) => {
    groups[status] = posts.filter((post) => post.status === status);
    return groups;
  }, {});
}

export function getCurrentReviewStage(post) {
  return post.approvals?.find((approval) => approval.status === "Pending") || null;
}

export function getPendingActionsForRole(posts, role) {
  return posts.filter((post) => getCurrentReviewStage(post)?.role === role);
}

export function isOverdue(post) {
  return ["Ready for Review", "Pending Approval", "Needs Edit"].includes(post.status) && post.daysInStatus > 5;
}

export function getScoreBand(score) {
  if (score >= 80) return "strong";
  if (score >= 60) return "needs-edit";
  return "rejected";
}

export function getNextApprovalState(post, decision, note = "") {
  const approvals = post.approvals.map((approval) => ({ ...approval }));
  const index = approvals.findIndex((approval) => approval.status === "Pending");

  if (index === -1) return { approvals, status: post.status };

  const timestamp = new Date().toISOString();
  approvals[index] = {
    ...approvals[index],
    status: decision,
    note,
    timestamp,
  };

  if (decision === "Needs Edit") return { approvals, status: "Needs Edit" };
  if (decision === "Rejected") return { approvals, status: "Rejected" };

  if (index < approvals.length - 1) {
    approvals[index + 1] = {
      ...approvals[index + 1],
      status: "Pending",
      timestamp: "",
    };
    return { approvals, status: "Pending Approval" };
  }

  return { approvals, status: "Approved" };
}
