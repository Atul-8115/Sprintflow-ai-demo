import { runAgent } from '../../agent/index.js';
import { sessionStore } from '../../thread-context/index.js';
import { buildFeedbackBlocks } from '../views/feedback-builder.js';
import { buildEngineeringContext } from "../../utils/buildEngineeringContext.js";
import { getSprintMemory } from "../../memory/sprintMemory.js";
import { buildOperationalContext } from "../../utils/buildOperationalContext.js";
import { prioritizeContext } from "../../utils/contextPrioritizer.js";
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

    const {
      githubContext,
      recentMemory,
      historicalMemory,
      activeConcerns,
      resolvedConcerns,
      emergingConcerns,
    } = await buildOperationalContext(threadTs);

    const prioritizedContext =
      prioritizeContext(
        cleanedText,
        {
          githubContext,
          recentMemory,
          historicalMemory,
          activeConcerns,
          resolvedConcerns,
          emergingConcerns,
        }
      );

    console.log("Operational Context");

    console.log(
      "Prioritized Context:",
      prioritizedContext
    );

    const activeBlockers =
      activeConcerns
        .filter(Boolean)
        .slice(0, 5);  

    const recentSprintContext =
      recentMemory
        .map(memory => memory.summary)
        .join("\n");

    const historicalSprintContext =
      historicalMemory
        .map(memory => memory.summary)
        .join("\n");

    const question = cleanedText.toLowerCase();

    let responseFormat = "";

    if (
      question.includes("release") ||
      question.includes("blocking")
    ) {
      responseFormat = `
      STRICT RESPONSE MODE

      Return ONLY:

      🚨 *Release Blockers*
      • point
      • point

      Forbidden Sections:
      - Completed work
      - In progress
      - Blockers
      - Next steps
      - Action items
      - Sprint summaries
      - Key decisions
      `;
    }

    else if (
      question.includes("risk")
    ) {
      responseFormat = `
      STRICT RESPONSE MODE

      Return ONLY:

      ⚠️ *Current Engineering Risks*
      • point
      • point

      Forbidden Sections:
      - Completed work
      - In progress
      - Next steps
      - Action items
      `;
    }

    else if (
      question.includes("momentum")
    ) {
      responseFormat = `
      STRICT RESPONSE MODE

      Return ONLY:

      🚀 *Engineering Momentum*
      • point
      • point

      Rules:
      - Discuss resolved concerns
      - Discuss completed progress
      - Never mark active blockers as completed
      `;
    }

    else if (
      question.includes("focus")
    ) {
      responseFormat = `
      STRICT RESPONSE MODE

      Return ONLY:

      🧠 *Engineering Focus*
      • point
      • point

      Rules:
      - Describe engineering workstreams
      - Not individual tickets
      `;
    }
    `;`

    console.log(
  "\n🚀 MOMENTUM CONTEXT\n",
  JSON.stringify(
    prioritizedContext,
    null,
    2
  )
);
    
    const engineeringContext = `
      You are SprintFlow AI, an engineering intelligence copilot inside Slack.

      
      User Question:
      ${cleanedText}
      ${responseFormat}

      Active Concerns:
      ${prioritizedContext.activeConcerns.join(", ") || "None"}

      Resolved Concerns:
      ${prioritizedContext.resolvedConcerns.join(", ") || "None"}

      Emerging Concerns:
      ${prioritizedContext.emergingConcerns.join(", ") || "None"}

      ACTIVE SPRINT BLOCKERS (Highest Priority):
      ${activeBlockers.join("\n") || "No active blockers identified"}

      RECENT OPERATIONAL SUMMARY:
      ${recentSprintContext || "No recent sprint context available"}

      HISTORICAL SPRINT CONTEXT:
      ${prioritizedContext.includeHistorical
        ? historicalSprintContext
        : "Historical context omitted"}

      GITHUB ENGINEERING SIGNALS:
      ${githubContext}


      MISSION:
      Provide operational engineering intelligence, not issue summaries.

      CONTEXT PRIORITY ORDER:

      1. User Question
      2. Active Sprint Blockers
      3. Recent Sprint Context
      4. GitHub Engineering Signals
      5. Historical Sprint Context

      REASONING RULES:

      - Answer ONLY the user's specific question
      - Use operational reasoning instead of ticket-level descriptions
      - Prioritize active blockers over GitHub activity
      - Prioritize recent sprint context over historical context
      - Use GitHub signals to validate concerns, not override sprint context
      - Mention historical context only if still operationally relevant
      - Resolve conflicting signals using severity and recency
      - Prefer operational impact over implementation details
      - Summarize concerns as organizational risks, not issue titles
      - Focus on engineering execution, release confidence, stability, delivery velocity, and operational health
      - Infer broader engineering concerns from low-level implementation issues
      - Do not mention "Open Issue", "Pull Request", or GitHub ticket names unless absolutely necessary
      - Keep responses concise and actionable
      - Never return plain paragraphs
      - Never generate generic sprint summaries
      - Avoid repeating the same concern multiple times
      - End responses cleanly
      - Do not restate the same concern multiple times
      - Merge related engineering concerns into a single risk
      - Prefer 3-4 high-impact risks instead of many overlapping risks
      - Each bullet must represent a unique operational concern
      - Avoid rephrasing the same blocker in different ways
      - Prefer sprint discussion evidence over repository-wide activity when answering operational questions
      - Use only the context most relevant to the user's question
      - Ignore unrelated context even if provided

      TEMPORAL REASONING:

      - Treat partially resolved concerns as lower priority than active blockers
      - Treat resolved concerns as historical context
      - Do not elevate resolved concerns above active blockers
      - Highlight emerging concerns when they introduce new release risk
      - Prefer active concerns when assessing release readiness
      - Mention resolved concerns only when discussing engineering momentum
      - Do not report resolved concerns inside Release Blockers
      - Mention resolved concerns only as supporting context

      Classify concerns as:
      - Active
      - Resolved
      - Emerging

      When analyzing engineering context:
      - Do not report resolved concerns as active blockers
      - Highlight newly emerging concerns when relevant
      - Prioritize active concerns over historical concerns
      - Reduce emphasis on partially resolved issues

      QUESTION-SPECIFIC BEHAVIOR:

      For Release Readiness:
      - Prioritize Active Concerns and Emerging Concerns

      For Engineering Momentum:
      - Prioritize Resolved Concerns and Recent Progress
      - Never infer completion.
      - Only discuss concerns that appear in Resolved Concerns.

      For Engineering Risks:
      - Prioritize Active Concerns and Stability Signals

      For Engineering Focus:
      - Prioritize recurring themes across Recent Sprint Context

      For Release Blockers:
      - Report only blockers that actively threaten release confidence or deployment stability

      FORMAT RULES:

      - Use Slack-friendly formatting
      - Use emoji section headers
      - Use bullet points with "•"
      - Maximum 4 bullet points
      - Prefer fewer high-signal insights over exhaustive lists
      - Keep bullets concise
      - Maintain executive-level tone
      - Each bullet must describe a unique engineering concern
      - Do not create summary bullets that simply restate previous risks
      - Avoid generic risks like "delivery risk" or "operational risk" when specific blockers are available
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
