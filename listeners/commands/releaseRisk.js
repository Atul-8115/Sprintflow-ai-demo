import {
  getPullRequests,
  getIssues,
  getCommits,
} from "../../services/githubService.js";

import { generateResponse } from "../../gemini.js";

export async function handleReleaseRisk({
  ack,
  respond,
}) {
  await ack();

  try {
    // Fetch GitHub data
    const prs = await getPullRequests();
    const issues = await getIssues();
    const commits = await getCommits();

    // Format PR titles
    const prTitles = prs
      .slice(0, 5)
      .map((pr) => `• ${pr.title}`)
      .join("\n");

    // Format issue titles
    const issueTitles = issues
      .slice(0, 5)
      .map((issue) => `• ${issue.title}`)
      .join("\n");

    // Format commit messages
    const commitMessages = commits
      .slice(0, 5)
      .map(
        (commit) =>
          `• ${commit.commit.message}`
      )
      .join("\n");

    // AI Prompt
    const prompt = `
        You are SprintFlow AI, an AI release engineering copilot.

        Analyze the following engineering activity and determine release readiness.

        Engineering Context:

        Open Pull Requests:
        ${prTitles}

        Open Issues:
        ${issueTitles}

        Recent Commits:
        ${commitMessages}

        IMPORTANT:
        - Assess release readiness intelligently
        - Consider regressions, blockers, stability risks, issue severity, and engineering momentum
        - Generate a realistic release readiness score from 0-100
        - 80-100 → 🟢 Low Risk
        - 60-79 → 🟡 Medium Risk
        - 0-59 → 🔴 High Risk
        - Use concise Slack-friendly formatting
        - Use emojis in section headings
        - Use bullet points with "•"
        - Avoid generic statements
        - Avoid vague statements like "multiple issues detected"
        - Mention specific engineering concerns when possible
        - Keep each bullet under 14 words
        - Summarize issue titles instead of copying them directly
        - Never quote full GitHub issue titles
        - Use concise operational language
        - Write like an engineering lead giving sprint updates
        - Use concise but descriptive engineering terminology

        REQUIRED RESPONSE FORMAT:

        🚦 *Release Readiness Score:* XX/100
        ⚠️ *Risk Level:* 🟢 Low | 🟡 Medium | 🔴 High

        ⚠️ *Key Engineering Risks*
        • point
        • point

        📌 *Recommended Mitigations*
        • point
        • point

        🚀 *Final Release Insight*
        Short concise operational insight.
    `;

    // Generate AI response
    const aiResponse =
      await generateResponse(prompt);

    // Final response
    await respond({
      text: aiResponse,
    });

  } catch (error) {
    console.error(
      "Release Risk Error:",
      error
    );

    await respond({
      text:
        "⚠️ Failed to analyze release risks.",
    });
  }
}