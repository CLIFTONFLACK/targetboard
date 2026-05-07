export function buildManualTitle(url) {
  return String(url || "")
    .replace(/^https?:\/\/(www\.)?/, "")
    .replace(/[-/]+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .slice(0, 72);
}

export function buildMockAgentOutput(post) {
  return {
    ...post,
    status: "Ready for Review",
    daysInStatus: 0,
    selectedAngle: "Bottlenecks are invisible",
    suggestedAngles: [
      {
        angle: "Bottlenecks are invisible",
        reason: "The URL appears to focus on workflow friction that normal metrics miss.",
        recommended: true,
      },
    ],
    execSummary:
      "The article argues that delivery slowdowns often begin inside invisible workflow friction. Leaders need an intelligence layer that connects code decisions, review pressure, and delivery outcomes.",
    takeaways: [
      "Bottlenecks are often hidden inside review queues.",
      "Metrics show delay after the system has already slowed.",
      "AI increases the volume of changes leaders must interpret.",
    ],
    newsletterBlurb:
      "Delivery bottlenecks are not always visible in the tools leaders already use. This piece explains how workflow friction hides inside code review, rework, and delivery risk.",
    cta: "Read the full breakdown",
    assets: [
      {
        id: `${post.id}-asset`,
        type: "Company Post",
        score: 82,
        recommendation: true,
        recommendationReason: "Strong enough for Stage 1 review.",
        breakdown: {
          hook: 16,
          problem_clarity: 17,
          system_insight: 17,
          tb_positioning: 13,
          icp_relevance: 13,
          distinctiveness: 6,
        },
        copy:
          "Delivery bottlenecks rarely announce themselves.\n\nThey show up later, after review queues stretch, rework repeats, and forecasts start slipping.\n\nThat is why engineering leaders need more than activity metrics.\n\nThey need a system that explains where friction is forming and what to do next.",
      },
    ],
    approvals: post.approvals.map((approval, index) => ({
      ...approval,
      status: index === 0 ? "Pending" : "Locked",
      timestamp: "",
      note: "",
    })),
  };
}
