export const reviewers = [
  { role: "VP Brand", name: "Maya Brand", email: "maya@targetboard.ai" },
  { role: "VP Product", name: "Ilan Product", email: "ilan@targetboard.ai" },
  { role: "CEO", name: "Clifton", email: "clifton@targetboard.ai" },
];

export const approvedAngles = [
  "Metrics are misleading",
  "AI creates hidden complexity",
  "Bottlenecks are invisible",
  "Dashboards don't explain change",
  "Delivery predictability is breaking",
  "Code review is the control point",
];

export const ctaTemplates = [
  "Read the full breakdown",
  "Book a demo",
  "See what is actually driving delivery risk",
  "Talk to TargetBoard",
];

const scoreBreakdown = {
  hook: 18,
  problem_clarity: 18,
  system_insight: 17,
  tb_positioning: 14,
  icp_relevance: 14,
  distinctiveness: 9,
};

export const seedPosts = [
  {
    id: "code-review-control-point",
    title: "Code review is the control point AI is overwhelming",
    url: "https://targetboard.ai/blog/code-review-control-point",
    publishDate: "2026-05-01",
    category: "AI Impact",
    targetKeyword: "AI code review risk",
    audienceTag: "VP Engineering",
    status: "Ready for Review",
    daysInStatus: 2,
    selectedAngle: "Code review is the control point",
    suggestedAngles: [
      {
        angle: "Code review is the control point",
        reason: "The article frames review as the last quality gate under AI-generated volume.",
        recommended: true,
      },
      {
        angle: "AI creates hidden complexity",
        reason: "The strongest operational risk is invisible complexity entering the codebase.",
      },
    ],
    execSummary:
      "AI coding tools increase code output, but they also increase review pressure and hidden complexity. The article argues that engineering leaders need a way to understand what changed, why it changed, and which code decisions create delivery risk.",
    takeaways: [
      "AI increases review volume faster than review capacity.",
      "The last quality gate is becoming the first delivery bottleneck.",
      "Standard metrics show throughput, not hidden risk.",
      "Complexity needs to be scored before it affects delivery.",
      "Engineering leaders need decision-grade understanding.",
    ],
    snippets: [
      "The bottleneck is no longer writing code. It is understanding what changed.",
      "AI did not remove review risk. It moved it into the system faster.",
      "More output is not the same as better delivery.",
    ],
    newsletterBlurb:
      "AI has increased code output, but code review is becoming the control point that cannot keep up. This piece explains why engineering leaders need a scoring model for hidden complexity before it becomes delivery drag.",
    cta: "Read the full breakdown",
    internalLinks: [
      { title: "AI impact on delivery", url: "#", context: "Related system narrative for AI-driven risk." },
      { title: "Engineering scoring model", url: "#", context: "Bottom-funnel product positioning." },
    ],
    assets: [
      {
        id: "asset-1",
        type: "Company Post",
        score: 90,
        recommendation: true,
        recommendationReason: "Strong contradiction, clear ICP pain, and specific TargetBoard positioning.",
        breakdown: scoreBreakdown,
        copy:
          "Engineering teams are shipping more code with AI.\n\nThat sounds like progress.\n\nBut for many leaders, the real bottleneck has moved downstream. Code review is now absorbing more volume, more hidden complexity, and more decisions that standard metrics cannot explain.\n\nThe question is no longer whether AI increased output.\n\nThe question is whether the system can understand the risk entering delivery.\n\nTargetBoard exists for that layer: signals from Git, Jira, and CI/CD become decision-grade intelligence that explains what changed, why it changed, and what to do next.\n\nWhat is the control point your team trusts most today?",
      },
      {
        id: "asset-2",
        type: "Tactical Post",
        score: 84,
        recommendation: true,
        recommendationReason: "Practical operator framing with a clear review checklist.",
        breakdown: { ...scoreBreakdown, hook: 16, distinctiveness: 8 },
        copy:
          "A practical test for AI code review:\n\n1. Which PRs introduce the most hidden complexity?\n2. Which changes create repeat review cycles?\n3. Which files keep driving rework?\n4. Which review queues are slowing delivery?\n5. Which risks will not show up in cycle time until it is too late?\n\nIf your team cannot answer those questions, the problem is not effort.\n\nIt is missing operational intelligence.",
      },
      {
        id: "asset-3",
        type: "Short Teaser",
        score: 73,
        recommendation: false,
        recommendationReason: "Useful, but too light for primary review.",
        breakdown: { ...scoreBreakdown, hook: 14, system_insight: 13, distinctiveness: 6 },
        copy:
          "AI did not eliminate engineering bottlenecks. It changed where they hide.\n\nThe next control point is code review. Read the full breakdown.",
      },
    ],
    approvals: [
      { stage: 1, role: "VP Brand", reviewer: "Maya Brand", status: "Pending", timestamp: "", note: "" },
      { stage: 2, role: "VP Product", reviewer: "Ilan Product", status: "Locked", timestamp: "", note: "" },
      { stage: 3, role: "CEO", reviewer: "Clifton", status: "Locked", timestamp: "", note: "" },
    ],
    publishMode: "Manual",
    scheduledDate: "",
    channel: "Both",
  },
  {
    id: "cycle-time-misleading",
    title: "Why cycle time stopped explaining delivery risk",
    url: "https://targetboard.ai/blog/cycle-time-delivery-risk",
    publishDate: "2026-04-24",
    category: "Delivery",
    targetKeyword: "cycle time engineering",
    audienceTag: "CTO",
    status: "Pending Approval",
    daysInStatus: 6,
    selectedAngle: "Metrics are misleading",
    suggestedAngles: [
      {
        angle: "Metrics are misleading",
        reason: "The article shows how dashboard signals miss system-level delivery friction.",
        recommended: true,
      },
    ],
    execSummary:
      "Cycle time can show that delivery slowed down, but it cannot explain why. The article reframes delivery measurement around hidden drivers: rework, complexity, review churn, and fragmented engineering systems.",
    takeaways: [
      "Cycle time measures motion, not causality.",
      "Hidden rework distorts delivery forecasts.",
      "Engineering leaders need an explanation layer.",
      "Metrics become useful when connected to decisions.",
    ],
    snippets: ["The metric is not wrong. It is incomplete.", "Dashboards show change. Leaders need cause."],
    newsletterBlurb:
      "Cycle time shows whether delivery moved. It does not explain which code decisions, workflows, or risks caused the slowdown. This article reframes delivery metrics around decision-grade understanding.",
    cta: "See what is actually driving delivery risk",
    internalLinks: [{ title: "Delivery predictability", url: "#", context: "Core TargetBoard use case." }],
    assets: [
      {
        id: "asset-4",
        type: "Company Post",
        score: 86,
        recommendation: true,
        recommendationReason: "Clear metric contradiction and strong executive relevance.",
        breakdown: { ...scoreBreakdown, hook: 17 },
        copy:
          "Cycle time tells you delivery slowed down.\n\nIt does not tell you why.\n\nThat gap matters more in the AI era, because teams are creating more code, more change, and more hidden complexity than their review systems were built to interpret.\n\nEngineering leaders do not need another chart.\n\nThey need to understand which signals actually explain performance: rework, churn, complexity, blocked flow, review pressure, and delivery risk.\n\nThat is the difference between metrics and operational intelligence.",
      },
    ],
    approvals: [
      {
        stage: 1,
        role: "VP Brand",
        reviewer: "Maya Brand",
        status: "Approved",
        timestamp: "2026-05-03T09:30:00.000Z",
        note: "Strong enough for product review.",
      },
      { stage: 2, role: "VP Product", reviewer: "Ilan Product", status: "Pending", timestamp: "", note: "" },
      { stage: 3, role: "CEO", reviewer: "Clifton", status: "Locked", timestamp: "", note: "" },
    ],
    publishMode: "Manual",
    scheduledDate: "",
    channel: "Newsletter",
  },
  {
    id: "ai-scoring-model",
    title: "AI impact needs a scoring model, not a dashboard",
    url: "https://targetboard.ai/blog/ai-impact-scoring-model",
    publishDate: "2026-04-18",
    category: "Scoring Model",
    targetKeyword: "AI engineering scoring model",
    audienceTag: "Head of Platform",
    status: "Scheduled",
    daysInStatus: 1,
    selectedAngle: "AI creates hidden complexity",
    suggestedAngles: [{ angle: "AI creates hidden complexity", reason: "Strong bottom-funnel fit.", recommended: true }],
    execSummary:
      "The article explains why leaders need a scoring model for AI-generated complexity and delivery impact. It positions TargetBoard as the operational intelligence layer between raw engineering signals and execution decisions.",
    takeaways: [
      "AI impact cannot be understood by volume alone.",
      "Complexity and maintainability risk need objective scoring.",
      "Decision-grade signals improve prioritisation.",
    ],
    snippets: ["A dashboard can show activity. A scoring model can explain risk."],
    newsletterBlurb:
      "A dashboard can show that AI changed engineering activity. A scoring model explains whether that change improved delivery or introduced risk.",
    cta: "Book a demo",
    internalLinks: [],
    assets: [
      {
        id: "asset-5",
        type: "Company Post",
        score: 88,
        recommendation: true,
        recommendationReason: "Strong bottom-funnel positioning without leading with product.",
        breakdown: scoreBreakdown,
        copy:
          "AI impact cannot be measured by output alone.\n\nThe real question is whether code quality, maintainability, rework, and delivery risk are improving or degrading.\n\nThat requires a scoring model.\n\nNot another dashboard.",
      },
    ],
    approvals: [
      { stage: 1, role: "VP Brand", reviewer: "Maya Brand", status: "Approved", timestamp: "2026-04-21T10:00:00.000Z", note: "" },
      { stage: 2, role: "VP Product", reviewer: "Ilan Product", status: "Approved", timestamp: "2026-04-22T11:00:00.000Z", note: "" },
      { stage: 3, role: "CEO", reviewer: "Clifton", status: "Approved", timestamp: "2026-04-23T12:00:00.000Z", note: "" },
    ],
    publishMode: "Manual",
    scheduledDate: "2026-05-09",
    channel: "Both",
  },
  {
    id: "new-blog-row",
    title: "Bottlenecks are invisible until delivery slips",
    url: "https://targetboard.ai/blog/invisible-bottlenecks",
    publishDate: "2026-05-06",
    category: "Workflow",
    targetKeyword: "engineering bottlenecks",
    audienceTag: "VP Engineering",
    status: "New",
    daysInStatus: 1,
    selectedAngle: "",
    suggestedAngles: [],
    execSummary: "Waiting for content extraction.",
    takeaways: [],
    snippets: [],
    newsletterBlurb: "",
    cta: "",
    internalLinks: [],
    assets: [],
    approvals: [
      { stage: 1, role: "VP Brand", reviewer: "Maya Brand", status: "Locked", timestamp: "", note: "" },
      { stage: 2, role: "VP Product", reviewer: "Ilan Product", status: "Locked", timestamp: "", note: "" },
      { stage: 3, role: "CEO", reviewer: "Clifton", status: "Locked", timestamp: "", note: "" },
    ],
    publishMode: "Manual",
    scheduledDate: "",
    channel: "LinkedIn",
  },
];

export const activityLog = [
  {
    id: "act-1",
    timestamp: "2026-05-06T09:12:00.000Z",
    title: "Bottlenecks are invisible until delivery slips",
    action: "New blog row created",
    actor: "RSS check",
  },
  {
    id: "act-2",
    timestamp: "2026-05-05T15:30:00.000Z",
    title: "Code review is the control point AI is overwhelming",
    action: "Ready for review",
    actor: "Content Agent",
  },
  {
    id: "act-3",
    timestamp: "2026-05-03T09:30:00.000Z",
    title: "Why cycle time stopped explaining delivery risk",
    action: "Stage 1 approved",
    actor: "Maya Brand",
  },
];
