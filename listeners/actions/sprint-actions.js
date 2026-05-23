import { generateResponse } from '../../gemini.js';
import { generateAnalytics } from '../../utils/generateAnalytics.js';
import { generateRisks } from '../../utils/generateRisks.js';

/**
 * Handle Generate Risks button
 */

export async function handleGenerateRisks({
  ack,
  body,
  client,
}) {
  await ack();

  // TEMP mock values
  const blockers = 1;
  const inProgress = 2;

  const risks = generateRisks(
    blockers,
    inProgress
  );

  await client.chat.postMessage({
    channel: body.channel.id,
    thread_ts: body.container.message_ts,
    text:
      `⚠️ *Potential Sprint Risks*\n\n` +
      risks.map(risk => `• ${risk}`).join('\n'),
  });
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

  // TEMP mock metrics
  const completed = 2;
  const inProgress = 2;
  const blockers = 1;

  const analytics = generateAnalytics(
    completed,
    inProgress,
    blockers
  );

  await client.chat.postMessage({
    channel: body.channel.id,
    thread_ts: body.container.message_ts,
    text:
      `📊 *Detailed Sprint Analytics*\n\n` +
      `• Team Velocity: ${analytics.velocity}\n` +
      `• Sprint Forecast: ${analytics.forecast}\n` +
      `• Risk Level: ${analytics.risk}\n` +
      `• Active Contributors: ${analytics.contributors}\n` +
      `• Open Pull Requests: ${analytics.prs}`,
  });
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
      .map(msg => msg.text || '')
      .join('\n');

    // AI prompt
    const prompt = `
        You are SprintFlow AI.

        Summarize this engineering Slack discussion.

        STRICT FORMATTING RULES:
        - Keep response concise
        - Use professional engineering language
        - Use emojis in section titles
        - Use bullet points
        - Keep formatting clean for Slack

        FORMAT:

        🚀 *Key Decisions*
        • decision here

        ⚠️ *Risks / Blockers*
        • blocker here

        📌 *Action Items*
        • action here

        📝 *Final Summary*
        Short final summary here

        Thread:
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