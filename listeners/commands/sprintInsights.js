import {
  getPullRequests,
  getIssues,
  getCommits,
} from "../../services/githubService.js";

import { generateResponse } from "../../gemini.js";

export async function handleSprintInsights({
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

    // Format Issue titles
    const issueTitles = issues
      .slice(0, 5)
      .map((issue) => `• ${issue.title}`)
      .join("\n");

    // Format Commit messages
    const commitMessages = commits
      .slice(0, 5)
      .map(
        (commit) => `• ${commit.commit.message}`
      )
      .join("\n");

    // AI Prompt
    const prompt = `
      You are an AI engineering sprint copilot.

      Analyze the provided engineering sprint activity.

      Open Pull Requests:
      ${prTitles}

      Open Issues:
      ${issueTitles}

      Recent Commits:
      ${commitMessages}

      Generate a concise Slack-formatted report using EXACTLY this structure:

      🧠 *Sprint Health Assessment*
      • point
      • point

      ⚠️ *Engineering Risks*
      • point
      • point

      🛠️ *Operational Concerns*
      • point
      • point

      📌 *Recommended Actions*
      • point
      • point

      🚀 *Final Engineering Insight*
      Short final insight paragraph.

      IMPORTANT:
      - Use bullet points with "•"
      - Keep formatting Slack-friendly
      - Keep response concise
      - Use emojis in headings only
      - Avoid markdown headings like ##
      - Avoid numbering
      - Keep each bullet under 30 words
      - Use concise engineering language
      - Optimize readability for Slack
    `;

    // Generate AI response
    const aiResponse =
      await generateResponse(prompt);

    // Send Slack response
    await respond({
      text:
        `🧠 *Sprint Insights*\n\n${aiResponse}`,
    });

  } catch (error) {
    console.error(
      "Sprint Insights Error:",
      error
    );

    await respond({
      text:
        "⚠️ Failed to generate sprint insights.",
    });
  }
}