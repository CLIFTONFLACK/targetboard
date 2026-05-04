// Core domain types — derived from spec v1.3 §6.2 and §15.12.

export type Status =
  | "New"
  | "Processing"
  | "Ready for Review"
  | "Recommended"
  | "Pending Approval"
  | "Approved"
  | "Needs Edit"
  | "Rejected"
  | "Scheduled"
  | "Published";

export type AssetType =
  | "company_post"
  | "tactical_post"
  | "teaser_a"
  | "teaser_b"
  | "exec_post"
  | "carousel_outline";

export type AudienceTag = "VP Engineering" | "CTO" | "Head of Platform" | "Engineering Leader";

export type StageDecision = "Pending" | "Approved" | "Needs Edit" | "Rejected";

export type PublishMode = "Manual" | "Auto-post";

export type Channel = "LinkedIn" | "Newsletter" | "Both";

// Per spec §5.3 — each criterion 0–20, summed to 0–100 (weights as integer caps).
export interface ScoreBreakdown {
  hook: number;
  problem_clarity: number;
  system_insight: number;
  tb_positioning: number; // weight 15 — value clamped 0–15 in scorer
  icp_relevance: number; // weight 15
  distinctiveness: number; // weight 10
}

export interface Asset {
  type: AssetType;
  copy: string;
  word_count: number;
  score: number;
  score_breakdown: ScoreBreakdown;
  recommendation: boolean;
  recommendation_reason: string;
}

// Content Tracker row — one row per blog post. Column letters tracked in lib/sheets/schema.ts.
export interface BlogRow {
  rowNumber?: number; // 2-indexed sheet row (row 1 is headers); set by tracker on read
  blogTitle: string;
  blogUrl: string;
  publishDate: string; // ISO YYYY-MM-DD
  category?: string;
  targetKeyword?: string;
  audienceTag?: AudienceTag | string;
  status: Status;
  suggestedAngles?: string;
  selectedAngle?: string;
  briefLink?: string;
  execSummary?: string;
  keyTakeaways?: string;
  linkedinPost1?: string;
  linkedinPost2?: string;
  teaser1?: string;
  teaser2?: string;
  execPost?: string;
  carouselYN?: "Y" | "N" | "";
  carouselOutlineLink?: string;
  newsletterBlurb?: string;
  suggestedCta?: string;
  scorePost1?: number | "";
  scorePost2?: number | "";
  scoreTeaser?: number | "";
  recommendedAsset?: string;
  stage1Approval?: StageDecision | "";
  stage2Approval?: StageDecision | "";
  stage3Approval?: StageDecision | "";
  editNotes?: string;
  publishMode?: PublishMode | "";
  scheduledDate?: string;
  channel?: Channel | "";
  publishedDate?: string;
  notes?: string;
}

// Newsletter assembly per spec §8 / §15.12.
export interface NewsletterDraft {
  month: string; // YYYY-MM
  featured_article: { title: string; blurb: string; url: string };
  articles: Array<{ title: string; blurb: string; url: string }>;
  subject_lines: string[];
  preview_texts: string[];
  cta: string;
  status: "Draft" | "Approved" | "Sent";
  send_date?: string;
}

// Activity Log row — one entry per status change or notable action.
export interface ActivityEntry {
  timestamp: string; // ISO
  postTitle: string;
  action: string;
  actor: string;
  notes?: string;
}
