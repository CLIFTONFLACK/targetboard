export const CONTENT_TRACKER_HEADERS = [
  "ID",
  "Blog Title",
  "Blog URL",
  "Publish Date",
  "Category",
  "Target Keyword",
  "Audience Tag",
  "Status",
  "Days In Status",
  "Suggested Angles",
  "Selected Angle",
  "Exec Summary",
  "Key Takeaways",
  "Quote Snippets",
  "Newsletter Blurb",
  "Suggested CTA",
  "Internal Links",
  "Assets JSON",
  "Stage 1 Approval",
  "Stage 2 Approval",
  "Stage 3 Approval",
  "Approvals JSON",
  "Publish Mode",
  "Scheduled Date",
  "Channel",
  "Published Date",
  "Notes",
];

export const SETTINGS_HEADERS = ["Type", "Value", "Status"];
export const ACTIVITY_HEADERS = ["Timestamp", "Post Title", "Action", "Actor", "Notes"];

export function stateToSheets(state) {
  return {
    "Content Tracker": [CONTENT_TRACKER_HEADERS, ...state.posts.map(postToRow)],
    Settings: [
      SETTINGS_HEADERS,
      ...(state.settings?.approvedAngles || []).map((value) => ["approved_angle", value, "Active"]),
      ...(state.settings?.ctaTemplates || []).map((value) => ["cta_template", value, "Active"]),
      ["rss_url", state.settings?.rssUrl || "", "Active"],
      ["ai_provider", state.settings?.aiProvider || "", "Active"],
      ["ai_model", state.settings?.model || "", "Active"],
      ...(state.reviewers || []).map((reviewer) => ["reviewer", JSON.stringify(reviewer), "Active"]),
    ],
    "Activity Log": [
      ACTIVITY_HEADERS,
      ...(state.activities || []).map((activity) => [
        activity.timestamp,
        activity.title,
        activity.action,
        activity.actor,
        activity.notes || "",
      ]),
    ],
    "Scoring Log": [
      ["Post ID", "Post Title", "Asset ID", "Asset Type", "Score", "Breakdown JSON"],
      ...state.posts.flatMap((post) =>
        (post.assets || []).map((asset) => [
          post.id,
          post.title,
          asset.id,
          asset.type,
          asset.score,
          JSON.stringify(asset.breakdown || {}),
        ]),
      ),
    ],
    Newsletter: [["Month", "Status", "Featured Article", "Articles JSON", "Subject Lines JSON", "Preview Texts JSON", "CTA"]],
    "Carousel Log": [["Post ID", "Post Title", "Carousel Produced", "Outline Link", "Status"]],
  };
}

export function rowsToPosts(rows = []) {
  const [headers, ...dataRows] = rows;
  if (!headers) return [];
  return dataRows.filter((row) => row.some(Boolean)).map((row) => rowToPost(headers, row));
}

export function rowsToSettings(rows = []) {
  const [, ...dataRows] = rows;
  const settings = {
    approvedAngles: [],
    ctaTemplates: [],
    aiProvider: "OpenAI",
    model: "gpt-4o",
    sheets: {
      tabs: ["Content Tracker", "Newsletter", "Scoring Log", "Carousel Log", "Settings", "Activity Log"],
      mode: "google-sheets",
    },
    rssUrl: "https://targetboard.ai/blog/rss.xml",
  };
  const reviewers = [];

  for (const [type, value, status] of dataRows) {
    if (status && status !== "Active") continue;
    if (type === "approved_angle" && value) settings.approvedAngles.push(value);
    if (type === "cta_template" && value) settings.ctaTemplates.push(value);
    if (type === "rss_url" && value) settings.rssUrl = value;
    if (type === "ai_provider" && value) settings.aiProvider = value;
    if (type === "ai_model" && value) settings.model = value;
    if (type === "reviewer" && value) reviewers.push(parseJson(value, null));
  }

  return { ...settings, reviewers: reviewers.filter(Boolean) };
}

export function rowsToActivities(rows = []) {
  const [, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some(Boolean))
    .map(([timestamp, title, action, actor, notes], index) => ({
      id: `sheet-act-${index}-${timestamp || "missing"}`,
      timestamp,
      title,
      action,
      actor,
      notes,
    }));
}

function postToRow(post) {
  return [
    post.id,
    post.title,
    post.url,
    post.publishDate,
    post.category,
    post.targetKeyword,
    post.audienceTag,
    post.status,
    post.daysInStatus,
    JSON.stringify(post.suggestedAngles || []),
    post.selectedAngle,
    post.execSummary,
    JSON.stringify(post.takeaways || []),
    JSON.stringify(post.snippets || []),
    post.newsletterBlurb,
    post.cta,
    JSON.stringify(post.internalLinks || []),
    JSON.stringify(post.assets || []),
    post.approvals?.[0]?.status || "",
    post.approvals?.[1]?.status || "",
    post.approvals?.[2]?.status || "",
    JSON.stringify(post.approvals || []),
    post.publishMode,
    post.scheduledDate,
    post.channel,
    post.publishedDate || "",
    post.notes || "",
  ];
}

function rowToPost(headers, row) {
  const get = (name) => row[headers.indexOf(name)] ?? "";
  return {
    id: get("ID") || slugId(get("Blog Title")),
    title: get("Blog Title"),
    url: get("Blog URL"),
    publishDate: get("Publish Date"),
    category: get("Category"),
    targetKeyword: get("Target Keyword"),
    audienceTag: get("Audience Tag"),
    status: get("Status"),
    daysInStatus: Number(get("Days In Status") || 0),
    suggestedAngles: parseJson(get("Suggested Angles"), []),
    selectedAngle: get("Selected Angle"),
    execSummary: get("Exec Summary"),
    takeaways: parseJson(get("Key Takeaways"), []),
    snippets: parseJson(get("Quote Snippets"), []),
    newsletterBlurb: get("Newsletter Blurb"),
    cta: get("Suggested CTA"),
    internalLinks: parseJson(get("Internal Links"), []),
    assets: parseJson(get("Assets JSON"), []),
    approvals: parseJson(get("Approvals JSON"), []),
    publishMode: get("Publish Mode") || "Manual",
    scheduledDate: get("Scheduled Date"),
    channel: get("Channel") || "LinkedIn",
    publishedDate: get("Published Date"),
    notes: get("Notes"),
  };
}

function parseJson(value, fallback) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function slugId(value) {
  return String(value || "post")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
