import { describe, expect, it } from "vitest";
import {
  getCurrentReviewStage,
  getPendingActionsForRole,
  groupPostsByStatus,
  isOverdue,
  statusOrder,
} from "./statusHelpers";

const posts = [
  {
    id: "ai-review-risk",
    status: "Pending Approval",
    daysInStatus: 6,
    approvals: [
      { stage: 1, role: "VP Brand", status: "Approved" },
      { stage: 2, role: "VP Product", status: "Pending" },
      { stage: 3, role: "CEO", status: "Locked" },
    ],
  },
  {
    id: "delivery-metrics",
    status: "Ready for Review",
    daysInStatus: 2,
    approvals: [
      { stage: 1, role: "VP Brand", status: "Pending" },
      { stage: 2, role: "VP Product", status: "Locked" },
      { stage: 3, role: "CEO", status: "Locked" },
    ],
  },
  {
    id: "scheduled-post",
    status: "Scheduled",
    daysInStatus: 1,
    approvals: [
      { stage: 1, role: "VP Brand", status: "Approved" },
      { stage: 2, role: "VP Product", status: "Approved" },
      { stage: 3, role: "CEO", status: "Approved" },
    ],
  },
];

describe("status helpers", () => {
  it("groups posts into every pipeline status in canonical order", () => {
    const grouped = groupPostsByStatus(posts);

    expect(Object.keys(grouped)).toEqual(statusOrder);
    expect(grouped["Pending Approval"].map((post) => post.id)).toEqual(["ai-review-risk"]);
    expect(grouped.New).toEqual([]);
  });

  it("returns the first pending approval stage for a post", () => {
    expect(getCurrentReviewStage(posts[0])).toMatchObject({
      stage: 2,
      role: "VP Product",
    });
  });

  it("filters pending actions by reviewer role", () => {
    expect(getPendingActionsForRole(posts, "VP Product").map((post) => post.id)).toEqual([
      "ai-review-risk",
    ]);
    expect(getPendingActionsForRole(posts, "VP Brand").map((post) => post.id)).toEqual([
      "delivery-metrics",
    ]);
  });

  it("flags only review items stale for more than five business days", () => {
    expect(isOverdue(posts[0])).toBe(true);
    expect(isOverdue(posts[1])).toBe(false);
    expect(isOverdue(posts[2])).toBe(false);
  });
});
