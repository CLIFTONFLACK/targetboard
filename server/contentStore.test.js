import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createContentStore } from "./contentStore.js";

let tempDir;
let store;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "content-agent-store-"));
  store = createContentStore({
    filePath: join(tempDir, "store.json"),
    now: () => new Date("2026-05-07T09:00:00.000Z"),
  });
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("content store", () => {
  it("boots with seed app state when no local store exists", async () => {
    const state = await store.readState();

    expect(state.posts.length).toBeGreaterThan(0);
    expect(state.reviewers.map((reviewer) => reviewer.role)).toEqual(["VP Brand", "VP Product", "CEO"]);
    expect(state.settings.approvedAngles).toContain("Metrics are misleading");
  });

  it("appends manual blog rows and activity records", async () => {
    const state = await store.addManualPost("https://targetboard.ai/blog/test-post");
    const post = state.posts[0];

    expect(post.status).toBe("New");
    expect(post.url).toBe("https://targetboard.ai/blog/test-post");
    expect(post.approvals.every((approval) => approval.status === "Locked")).toBe(true);
    expect(state.activities[0]).toMatchObject({
      action: "Manual blog row created",
      actor: "Operator",
      title: post.title,
    });
  });

  it("persists approval transitions and unlocks the next reviewer", async () => {
    const state = await store.approvePost("code-review-control-point", {
      decision: "Approved",
      note: "Looks good.",
    });
    const post = state.posts.find((item) => item.id === "code-review-control-point");

    expect(post.status).toBe("Pending Approval");
    expect(post.approvals[0]).toMatchObject({
      role: "VP Brand",
      status: "Approved",
      note: "Looks good.",
    });
    expect(post.approvals[1]).toMatchObject({
      role: "VP Product",
      status: "Pending",
    });
    expect(state.activities[0]).toMatchObject({
      action: "Stage 1 approved",
      actor: "VP Brand",
      title: post.title,
    });
  });

  it("updates assets, regenerates assets, and schedules approved posts", async () => {
    await store.updateAsset("cycle-time-misleading", {
      assetId: "asset-4",
      copy: "Updated copy",
    });
    await store.regenerateAsset("cycle-time-misleading", {
      assetId: "asset-4",
      editNotes: "Make it sharper.",
    });
    const state = await store.schedulePost("cycle-time-misleading", {
      publishMode: "Manual",
      scheduledDate: "2026-05-12",
      channel: "Newsletter",
    });
    const post = state.posts.find((item) => item.id === "cycle-time-misleading");
    const asset = post.assets.find((item) => item.id === "asset-4");

    expect(asset.copy).toContain("Updated copy");
    expect(asset.copy).toContain("Revision note: Make it sharper.");
    expect(asset.score).toBe(89);
    expect(post.status).toBe("Scheduled");
    expect(post.scheduledDate).toBe("2026-05-12");
  });
});
