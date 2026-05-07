import { describe, expect, it } from "vitest";
import {
  ACTIVITY_HEADERS,
  CONTENT_TRACKER_HEADERS,
  SETTINGS_HEADERS,
  rowsToActivities,
  rowsToPosts,
  rowsToSettings,
  stateToSheets,
} from "./sheetsSchema.js";

const post = {
  id: "post-1",
  title: "Delivery metrics need context",
  url: "https://targetboard.ai/blog/delivery",
  publishDate: "2026-05-07",
  category: "Delivery",
  targetKeyword: "delivery metrics",
  audienceTag: "VP Engineering",
  status: "Ready for Review",
  daysInStatus: 3,
  selectedAngle: "Metrics are misleading",
  suggestedAngles: [{ angle: "Metrics are misleading", reason: "Strong fit", recommended: true }],
  execSummary: "Metrics show what changed, not why.",
  takeaways: ["Dashboards miss causality"],
  snippets: ["The metric is incomplete."],
  newsletterBlurb: "Engineering leaders need decision-grade understanding.",
  cta: "Read the full breakdown",
  internalLinks: [{ title: "AI impact", url: "#", context: "Related" }],
  assets: [
    {
      id: "asset-1",
      type: "Company Post",
      score: 86,
      recommendation: true,
      recommendationReason: "Strong",
      breakdown: { hook: 17 },
      copy: "Cycle time tells you what changed.",
    },
  ],
  approvals: [
    { stage: 1, role: "VP Brand", reviewer: "Maya Brand", status: "Approved", timestamp: "2026-05-07T09:00:00.000Z", note: "" },
    { stage: 2, role: "VP Product", reviewer: "Ilan Product", status: "Pending", timestamp: "", note: "" },
    { stage: 3, role: "CEO", reviewer: "Clifton", status: "Locked", timestamp: "", note: "" },
  ],
  publishMode: "Manual",
  scheduledDate: "",
  channel: "LinkedIn",
};

describe("Sheets schema", () => {
  it("round-trips content tracker rows without losing nested review data", () => {
    const sheets = stateToSheets({
      posts: [post],
      activities: [],
      reviewers: [],
      settings: { approvedAngles: [], ctaTemplates: [] },
    });
    const row = sheets["Content Tracker"][1];
    const restored = rowsToPosts([CONTENT_TRACKER_HEADERS, row]);

    expect(restored[0]).toMatchObject({
      id: "post-1",
      title: "Delivery metrics need context",
      status: "Ready for Review",
    });
    expect(restored[0].assets[0]).toMatchObject({ id: "asset-1", score: 86 });
    expect(restored[0].approvals[0]).toMatchObject({ stage: 1, status: "Approved" });
    expect(restored[0].approvals[1]).toMatchObject({ stage: 2, status: "Pending" });
  });

  it("converts settings and activity tabs to app state fields", () => {
    const settings = rowsToSettings([
      SETTINGS_HEADERS,
      ["approved_angle", "Metrics are misleading", "Active"],
      ["cta_template", "Book a demo", "Active"],
      ["rss_url", "https://targetboard.ai/rss.xml", "Active"],
      ["ai_provider", "OpenAI", "Active"],
      ["ai_model", "gpt-4o", "Active"],
    ]);
    const activities = rowsToActivities([
      ACTIVITY_HEADERS,
      ["2026-05-07T09:00:00.000Z", "Delivery metrics need context", "Ready for review", "Content Agent", ""],
    ]);

    expect(settings.approvedAngles).toEqual(["Metrics are misleading"]);
    expect(settings.ctaTemplates).toEqual(["Book a demo"]);
    expect(settings.rssUrl).toBe("https://targetboard.ai/rss.xml");
    expect(activities[0]).toMatchObject({ action: "Ready for review", actor: "Content Agent" });
  });
});
