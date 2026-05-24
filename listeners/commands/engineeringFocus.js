import {
  getPullRequests,
  getIssues,
  getCommits,
} from "../../services/githubService.js";

import { generateResponse } from "../../gemini.js";

export async function handleEngineeringFocus({
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
      .slice(0, 8)
      .map((pr) => `• ${pr.title}`)
      .join("\n");

    // Format Issue titles
    const issueTitles = issues
      .slice(0, 8)
      .map((issue) => `• ${issue.title}`)
      .join("\n");

    // Format Commit messages
    const commitMessages = commits
      .slice(0, 8)
      .map(
        (commit) =>
          `• ${commit.commit.message}`
      )
      .join("\n");

    // AI Prompt
    const prompt = `
        You are SprintFlow AI, an engineering intelligence copilot.

        Analyze the following engineering activity and identify the CURRENT ENGINEERING FOCUS AREAS.

        Engineering Context:

        Open Pull Requests:
        ${prTitles}

        Open Issues:
        ${issueTitles}

        Recent Commits:
        ${commitMessages}

        IMPORTANT:
        - Detect recurring engineering themes
        - Infer organizational engineering priorities
        - Summarize focus areas abstractly
        - DO NOT copy raw GitHub issue titles
        - DO NOT generate sprint summaries
        - Use concise operational language
        - Use Slack-friendly formatting
        - Use emojis in headings
        - Use bullet points with "•"
        - Keep each bullet under 20 words
        - Focus on engineering direction and momentum
        - Preserve specific engineering domains and technologies
        - Mention platforms/frameworks when relevant
        - Use descriptive engineering terminology
        - Avoid overly generic categories like "testing" or "optimization"
        - Focus on active engineering initiatives, not learning activities
        - Prefer infrastructure, stability, platform, and operational terminology
        - Infer broader engineering initiatives from low-level implementation work
        - Group related engineering activities into higher-level focus themes

        REQUIRED RESPONSE FORMAT:

        🧠 *Current Engineering Focus*
        • point
        • point
        • point

        🚀 *Engineering Momentum*
        • point
        • point
    `;

    // Generate AI response
    const aiResponse =
      await generateResponse(prompt);

    // Send Slack response
    await respond({
      text: aiResponse,
    });

  } catch (error) {
    console.error(
      "Engineering Focus Error:",
      error
    );

    await respond({
      text:
        "⚠️ Failed to analyze engineering focus.",
    });
  }
}