import { generateResponse } from '../../gemini.js';
import { generateAnalytics } from '../../utils/generateAnalytics.js';
import { generateRisks } from '../../utils/generateRisks.js';
import {getPullRequests,getIssues,getCommits,} from "../../services/githubService.js";
import { generateEngineeringInsights } from "../../utils/generateEngineeringInsights.js";

/**
 * Handle Generate Risks button
 */

export async function handleGenerateRisks({
  ack,
  body,
  client,
}) {
  await ack();

  try {
    const prs = await getPullRequests();
    const issues = await getIssues();
    const commits = await getCommits();

    const risks = [];

    if (prs.length >= 4) {
      risks.push(
        "⚠️ Elevated pull request activity may slow review cycles."
      );
    }

    if (issues.length >= 5) {
      risks.push(
        "⚠️ Growing issue backlog could impact sprint timelines."
      );
    }

    if (commits.length <= 3) {
      risks.push(
        "⚠️ Low commit activity may indicate reduced sprint momentum."
      );
    }

    if (risks.length === 0) {
      risks.push(
        "✅ No significant sprint delivery risks detected."
      );
    }

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text:
        `⚠️ *Potential Sprint Risks*\n\n` +
        risks.join("\n\n"),
    });

  } catch (error) {
    console.error("Risk Analysis Error:", error);

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text:
        "⚠️ Failed to generate sprint risks.",
    });
  }
}

/**
 * Handle View Details button
 */

export async function handleViewDetails({
  ack,
  body,
  client,
}) {
  await ack();

  try {
    const prs = await getPullRequests();
    const issues = await getIssues();
    const commits = await getCommits();

    const latestPR =
      prs[0]?.title || "No PRs found";

    const latestCommit =
      commits[0]?.commit?.message
        ?.split("\n")[0] || "No commits found";

      const engineeringInsights =
      generateEngineeringInsights({
        prs: prs.length,
        issues: issues.length,
        commits: commits.length,
        blockers: 1,
      });

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text:
        `📊 *Detailed Sprint Analytics*\n\n` +
        `• Open Pull Requests: ${prs.length}\n` +
        `• Open Issues: ${issues.length}\n` +
        `• Recent Commits: ${commits.length}\n\n` +
`━━━━━━━━━━━━━━\n\n` +

        `🚀 *Latest Pull Request*\n` +
        `• ${latestPR}\n\n` +
`━━━━━━━━━━━━━━\n\n` +

        `📝 *Latest Commit*\n` +
        `• ${latestCommit}\n\n` +
`━━━━━━━━━━━━━━\n\n` +

        `🧠 *Engineering Insights*\n` +
          engineeringInsights.join("\n")
    });

  } catch (error) {
    console.error("GitHub Analytics Error:", error);

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text:
        "⚠️ Failed to fetch GitHub analytics.",
    });
  }
}

/**
 * REAL AI THREAD SUMMARIZATION
 */
export async function handleSummarizeThread({
  ack,
  body,
  client,
}) {
  await ack();

  try {
    // Fetch thread replies
    const replies = await client.conversations.replies({
      channel: body.channel.id,
      ts: body.container.message_ts,
    });

    // Combine all thread messages
    const threadText = replies.messages
    .filter(msg =>
      !msg.bot_id &&
      msg.text
    )
    .map(msg => msg.text)
    .join('\n');

    // AI prompt
    const prompt = `
        You are an engineering sprint assistant.

        Analyze ONLY the provided Slack thread discussion.

        Do NOT include unrelated repository risks,
        GitHub metrics, or assumptions that are not
        explicitly discussed in the thread.

        Use bullet points with the symbol "•"
        instead of "-".

        Provide:

        🚀 Key Decisions
        ⚠️ Risks / Blockers
        📌 Action Items
        🧠 Final Summary

        Keep the summary concise,
        engineering-focused,
        and operationally actionable.

        Thread Discussion:
        ${threadText}
    `;

    // Generate AI summary
    const response = await generateResponse(prompt);

    // Send result
    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text: `📝 *AI Thread Summary*\n\n${response}`,
    });

  } catch (error) {
    console.error('Thread Summary Error:', error);

    await client.chat.postMessage({
      channel: body.channel.id,
      thread_ts: body.container.message_ts,
      text:
        "⚠️ Failed to summarize thread. Please try again.",
    });
  }
}