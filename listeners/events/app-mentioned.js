import { runAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';
import {
  getPullRequests,
  getIssues,
  getCommits,
} from "../../services/githubService.js";

/**
 * Handle app_mention events and run the agent.
 * @param {import('@slack/bolt').AllMiddlewareArgs & import('@slack/bolt').SlackEventMiddlewareArgs<'app_mention'>} args
 * @returns {Promise<void>}
 */
export async function handleAppMentioned({ client, context, event, logger, say, sayStream, setStatus }) {
  try {
    const channelId = event.channel;
    const text = event.text || '';
    const threadTs = event.thread_ts || event.ts;
    const userId = /** @type {string} */ (context.userId);

    // Strip the bot mention from the text
    const cleanedText = text.replace(/<@[A-Z0-9]+>/g, '').trim();

    if (!cleanedText) {
      await say({
        text: "Hey there! How can I help you? Ask me anything and I'll do my best.",
        thread_ts: threadTs,
      });
      return;
    }

    // Set assistant thread status with loading messages
    await setStatus({
      status: 'Thinking\u2026',
      loading_messages: [
        'Teaching the hamsters to type faster\u2026',
        'Untangling the internet cables\u2026',
        'Consulting the office goldfish\u2026',
        'Polishing up the response just for you\u2026',
        'Convincing the AI to stop overthinking\u2026',
      ],
    });

    // Get session ID for conversation context
    const existingSessionId = sessionStore.getSession(channelId, threadTs);

    // Fetch GitHub engineering context
    const prs = await getPullRequests();
    const issues = await getIssues();
    const commits = await getCommits();

    const prTitles = prs
      .slice(0, 5)
      .map((pr) => `• ${pr.title}`)
      .join("\n");

    const issueTitles = issues
      .slice(0, 5)
      .map((issue) => `• ${issue.title}`)
      .join("\n");

    const commitMessages = commits
      .slice(0, 5)
      .map(
        (commit) =>
          `• ${commit.commit.message}`
      )
      .join("\n");

      const engineeringContext = `
        You are SprintFlow AI, an engineering sprint copilot inside Slack.

        User Question:
        ${cleanedText}

        Engineering Context:

        Open Pull Requests:
        ${prTitles}

        Open Issues:
        ${issueTitles}

        Recent Commits:
        ${commitMessages}

        IMPORTANT RULES:
        - Answer ONLY the user's specific question
        - NEVER generate generic sprint summaries
        - NEVER generate sections like:
          Completed work
          In progress
          Next steps
        - Keep responses concise
        - Use Slack-friendly formatting
        - Use bullet points with "•"
        - Focus on operational engineering insights
        - Mention specific engineering risks/issues when relevant
        - Keep response under 6 bullet points
        - ALWAYS use emoji section headers
        - ALWAYS start response with a heading
        - NEVER return plain paragraphs
        - NEVER use markdown headings like ##
        - Avoid generic statements
        - Mention specific repo issues when possible

        REQUIRED RESPONSE FORMAT:

        ⚠️ *Current Engineering Risks*
        • point
        • point
        • point

        OR

        🚨 *Release Blockers*
        • point
        • point

        OR

        🚀 *Engineering Momentum*
        • point
        • point

        Respond ONLY in one of the above Slack-friendly formats.
      `;

    // Run the agent with deps for tool access
    const deps = { client, userId, channelId, threadTs, messageTs: event.ts, userToken: context.userToken };
    const { responseText, sessionId: newSessionId } =
        await runAgent(
          engineeringContext,
          existingSessionId ?? undefined,
          deps
        );

    // Stream response in thread with feedback buttons
    const streamer = sayStream();
    await streamer.append({ markdown_text: responseText });
    const feedbackBlocks = buildFeedbackBlocks();
    await streamer.stop({ blocks: feedbackBlocks });

    // Store session ID for future context
    if (newSessionId) {
      sessionStore.setSession(channelId, threadTs, newSessionId);
    }
  } catch (e) {
    logger.error(`Failed to handle app mention: ${e}`);
    await say({
      text: `:warning: Something went wrong! (${e})`,
      thread_ts: event.thread_ts || event.ts,
    });
  }
}
