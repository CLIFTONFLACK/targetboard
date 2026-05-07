import { describe, expect, it } from "vitest";
import { assembleNewsletterDraft } from "./newsletter";

const posts = [
  {
    id: "a",
    title: "Code review is breaking under AI volume",
    url: "https://targetboard.ai/blog/code-review-ai-volume",
    newsletterBlurb: "AI has increased output, but code review has become the control point that cannot keep up.",
    topScore: 91,
    channel: "Both",
  },
  {
    id: "b",
    title: "Why cycle time no longer explains delivery risk",
    url: "https://targetboard.ai/blog/cycle-time-delivery-risk",
    newsletterBlurb: "Cycle time shows motion, but it does not explain the hidden complexity slowing delivery.",
    topScore: 84,
    channel: "Newsletter",
  },
  {
    id: "c",
    title: "Dashboards show what changed, not why",
    url: "https://targetboard.ai/blog/dashboards-why",
    newsletterBlurb: "Engineering leaders need decision-grade understanding, not another surface of metrics.",
    topScore: 79,
    channel: "LinkedIn",
  },
  {
    id: "d",
    title: "AI impact needs a scoring model",
    url: "https://targetboard.ai/blog/ai-impact-scoring",
    newsletterBlurb: "A scoring model makes hidden complexity visible before it becomes delivery drag.",
    topScore: 88,
    channel: "Both",
  },
];

describe("newsletter assembly", () => {
  it("uses the highest-scored eligible article as featured and limits the issue", () => {
    const draft = assembleNewsletterDraft(posts, "May 2026");

    expect(draft.month).toBe("May 2026");
    expect(draft.featuredArticle.title).toBe("Code review is breaking under AI volume");
    expect(draft.articles.map((article) => article.title)).toEqual([
      "AI impact needs a scoring model",
      "Why cycle time no longer explains delivery risk",
    ]);
    expect(draft.subjectLines).toHaveLength(3);
    expect(draft.previewTexts).toHaveLength(2);
  });

  it("excludes posts without newsletter-compatible channels", () => {
    const draft = assembleNewsletterDraft(posts, "May 2026");

    expect(draft.articles.some((article) => article.title.includes("Dashboards"))).toBe(false);
  });
});
