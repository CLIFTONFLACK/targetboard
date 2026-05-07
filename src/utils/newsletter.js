export function assembleNewsletterDraft(posts, month = "Current Month") {
  const eligible = posts
    .filter((post) => ["Both", "Newsletter"].includes(post.channel))
    .filter((post) => post.newsletterBlurb)
    .sort((a, b) => b.topScore - a.topScore)
    .slice(0, 4);

  const [featuredArticle, ...articles] = eligible.map((post) => ({
    id: post.id,
    title: post.title,
    blurb: post.newsletterBlurb,
    url: post.url,
    score: post.topScore,
  }));

  return {
    month,
    status: "Draft",
    featuredArticle: featuredArticle || null,
    articles,
    subjectLines: [
      "What AI is really doing to engineering delivery",
      "The hidden risk inside faster engineering output",
      "Decision-grade signals for engineering leaders",
    ],
    previewTexts: [
      "This month: code review pressure, hidden complexity, and why delivery metrics need context.",
      "A practical read on turning engineering signals into better execution decisions.",
    ],
    cta: "Read the full breakdown",
  };
}
