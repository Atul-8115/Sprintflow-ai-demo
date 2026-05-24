import { runAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';
import {
  buildEngineeringContext,
} from "../../utils/buildEngineeringContext.js";
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

    const githubContext =
      await buildEngineeringContext();

      const engineeringContext = `
        You are SprintFlow AI, an engineering intelligence copilot inside Slack.

        User Question:
        ${cleanedText}

        ${githubContext}

        IMPORTANT RULES:
        - Answer ONLY the user's specific question
        - Use holistic operational reasoning
        - Combine engineering risks, release concerns, and momentum
        - NEVER generate generic sprint summaries
        - Use concise Slack-friendly formatting
        - Use emoji section headings
        - Use bullet points with "•"
        - Keep response under 6 bullet points
        - Focus on engineering intelligence
        - Mention specific operational concerns when relevant
        - NEVER return plain paragraphs
        - Summarize engineering issues semantically instead of copying GitHub titles
        - Write like an engineering lead reporting operational concerns
        - Infer broader engineering risks from low-level issues
        - Avoid phrases like "Open Issue" or "Open Pull Request"
        - Infer higher-level operational concerns from implementation-level issues
        - Summarize engineering concerns as organizational risks, not ticket descriptions

        REQUIRED RESPONSE FORMAT:

        ⚠️ *Current Engineering Risks*
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

        OR

        🧠 *Engineering Focus*
        • point
        • point
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
