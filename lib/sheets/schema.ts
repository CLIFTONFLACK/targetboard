// Single source of truth for the Google Sheets schema.
// Per spec v1.3 §6.2 the Content Tracker has 34 columns A→AH.
// Tab names per §6.1 + §15.10 step 5 (Activity Log added per §15).

import type { BlogRow } from "@/types";

export const TABS = {
  contentTracker: "Content Tracker",
  newsletter: "Newsletter",
  carouselLog: "Carousel Log",
  scoringLog: "Scoring Log",
  settings: "Settings",
  activityLog: "Activity Log",
} as const;

export type TabName = (typeof TABS)[keyof typeof TABS];

// Column letter ↔ BlogRow field mapping. Order matters — this drives both
// the bootstrap header row and the read/write helpers.
export const CONTENT_TRACKER_COLUMNS: Array<{
  col: string;
  header: string;
  field: keyof BlogRow;
}> = [
  { col: "A", header: "Blog Title", field: "blogTitle" },
  { col: "B", header: "Blog URL", field: "blogUrl" },
  { col: "C", header: "Publish Date", field: "publishDate" },
  { col: "D", header: "Category", field: "category" },
  { col: "E", header: "Target Keyword", field: "targetKeyword" },
  { col: "F", header: "Audience Tag", field: "audienceTag" },
  { col: "G", header: "Status", field: "status" },
  { col: "H", header: "Suggested Angles", field: "suggestedAngles" },
  { col: "I", header: "Selected Angle", field: "selectedAngle" },
  { col: "J", header: "Brief Link", field: "briefLink" },
  { col: "K", header: "Exec Summary", field: "execSummary" },
  { col: "L", header: "Key Takeaways", field: "keyTakeaways" },
  { col: "M", header: "LinkedIn Post 1", field: "linkedinPost1" },
  { col: "N", header: "LinkedIn Post 2", field: "linkedinPost2" },
  { col: "O", header: "Teaser 1", field: "teaser1" },
  { col: "P", header: "Teaser 2", field: "teaser2" },
  { col: "Q", header: "Exec Post", field: "execPost" },
  { col: "R", header: "Carousel (Y/N)", field: "carouselYN" },
  { col: "S", header: "Carousel Outline Link", field: "carouselOutlineLink" },
  { col: "T", header: "Newsletter Blurb", field: "newsletterBlurb" },
  { col: "U", header: "Suggested CTA", field: "suggestedCta" },
  { col: "V", header: "Score — Post 1", field: "scorePost1" },
  { col: "W", header: "Score — Post 2", field: "scorePost2" },
  { col: "X", header: "Score — Teaser", field: "scoreTeaser" },
  { col: "Y", header: "Recommended Asset", field: "recommendedAsset" },
  { col: "Z", header: "Stage 1 Approval", field: "stage1Approval" },
  { col: "AA", header: "Stage 2 Approval", field: "stage2Approval" },
  { col: "AB", header: "Stage 3 Approval", field: "stage3Approval" },
  { col: "AC", header: "Edit Notes", field: "editNotes" },
  { col: "AD", header: "Publish Mode", field: "publishMode" },
  { col: "AE", header: "Scheduled Date", field: "scheduledDate" },
  { col: "AF", header: "Channel", field: "channel" },
  { col: "AG", header: "Published Date", field: "publishedDate" },
  { col: "AH", header: "Notes", field: "notes" },
];

export const CONTENT_TRACKER_LAST_COL = "AH";

export const CONTENT_TRACKER_HEADERS = CONTENT_TRACKER_COLUMNS.map((c) => c.header);

export const FIELD_TO_COL: Partial<Record<keyof BlogRow, string>> = Object.fromEntries(
  CONTENT_TRACKER_COLUMNS.map((c) => [c.field, c.col]),
);

export const COL_TO_FIELD: Record<string, keyof BlogRow> = Object.fromEntries(
  CONTENT_TRACKER_COLUMNS.map((c) => [c.col, c.field]),
);

// Numeric-coerced fields (scores). Everything else stays as string.
const NUMERIC_FIELDS = new Set<keyof BlogRow>(["scorePost1", "scorePost2", "scoreTeaser"]);

export function rowArrayToBlogRow(row: string[], rowNumber: number): BlogRow {
  const out: Partial<BlogRow> = { rowNumber };
  for (let i = 0; i < CONTENT_TRACKER_COLUMNS.length; i++) {
    const { field } = CONTENT_TRACKER_COLUMNS[i]!;
    const raw = row[i] ?? "";
    if (NUMERIC_FIELDS.has(field)) {
      const n = raw === "" ? "" : Number(raw);
      (out as Record<string, unknown>)[field] = Number.isFinite(n) ? n : "";
    } else {
      (out as Record<string, unknown>)[field] = raw;
    }
  }
  return out as BlogRow;
}

export function blogRowToRowArray(r: Partial<BlogRow>): string[] {
  return CONTENT_TRACKER_COLUMNS.map(({ field }) => {
    const v = r[field];
    if (v === undefined || v === null) return "";
    return String(v);
  });
}

// Other tabs — simpler schemas for headers only.
export const NEWSLETTER_HEADERS = [
  "Month",
  "Status",
  "Featured Title",
  "Featured Blurb",
  "Featured URL",
  "Article 1 Title",
  "Article 1 Blurb",
  "Article 1 URL",
  "Article 2 Title",
  "Article 2 Blurb",
  "Article 2 URL",
  "Article 3 Title",
  "Article 3 Blurb",
  "Article 3 URL",
  "Subject Line A",
  "Subject Line B",
  "Subject Line C",
  "Preview Text A",
  "Preview Text B",
  "CTA",
  "Send Date",
  "Notes",
];

export const CAROUSEL_LOG_HEADERS = [
  "Date",
  "Blog Title",
  "Blog URL",
  "Outline Link",
  "Status",
  "Designer",
  "Notes",
];

export const SCORING_LOG_HEADERS = [
  "Timestamp",
  "Blog Title",
  "Asset Type",
  "Score",
  "Hook",
  "Problem Clarity",
  "System Insight",
  "TB Positioning",
  "ICP Relevance",
  "Distinctiveness",
  "Recommendation",
  "Reason",
];

export const SETTINGS_HEADERS = ["Key", "Value", "Notes"];

// Pre-seeded Settings rows per spec §14.8 (six approved angles), CTAs, reviewer placeholders.
export const SETTINGS_SEED_ROWS: string[][] = [
  ["rss_feed_url", "", "Blog RSS feed monitored by /api/rss/check"],
  ["openrouter_model", "anthropic/claude-sonnet-4.5", "Default model when AI_PROVIDER=openrouter"],
  // Approved angles (§14.8 / §5.1) — agent must select from these
  ["angle_1", "Metrics are misleading", "Dashboard signals disconnected from real engineering performance"],
  ["angle_2", "AI creates hidden complexity", "AI-generated code introduces invisible risk and technical debt"],
  ["angle_3", "Bottlenecks are invisible", "Workflow friction and delivery delays cannot be seen in standard tools"],
  ["angle_4", "Dashboards don't explain change", "Metrics show what, not why"],
  ["angle_5", "Delivery predictability is breaking", "Teams can no longer reliably forecast output"],
  ["angle_6", "Code review is the control point", "Last line of defence is failing under AI volume"],
  // CTAs
  ["cta_primary_1", "Read the full breakdown →", "Primary CTA — top-funnel"],
  ["cta_primary_2", "See how TargetBoard scores AI-generated code", "Primary CTA — mid-funnel"],
  ["cta_secondary_1", "Book a demo", "Secondary CTA — bottom-funnel"],
  // Reviewer roles (placeholder emails — fill in via Sheet)
  ["reviewer_stage_1", "vp-brand@targetboard.ai", "Stage 1 — VP Brand"],
  ["reviewer_stage_2", "vp-product@targetboard.ai", "Stage 2 — VP Product"],
  ["reviewer_stage_3", "ceo@targetboard.ai", "Stage 3 — CEO"],
];

export const ACTIVITY_LOG_HEADERS = ["Timestamp", "Post Title", "Action", "Actor", "Notes"];
