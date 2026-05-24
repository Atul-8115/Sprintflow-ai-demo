import { runAgent } from '../agent/agent.js';
import { buildSummaryBlocks } from '../utils/buildSummaryBlocks.js';
import { generateInsight } from '../utils/generateInsights.js';
import { handleSprintInsights } from "./commands/sprintInsights.js";
import { handleReleaseRisk } from "./commands/releaseRisk.js";

export default function registerCommands(app) {
  app.command('/daily-summary', async ({
    ack,
    client,
    command,
  }) => {
    await ack();

    const result = await runAgent(
      'Generate a concise engineering sprint summary'
    );

    const insight = generateInsight(result.responseText);

    const blocks = buildSummaryBlocks(
        result.responseText,
        insight
    );

    await client.chat.postMessage({
      channel: command.channel_id,
      blocks,
      text: 'Sprint Summary',
    });
  });

  app.command(
    "/sprint-insights",
    handleSprintInsights
  );

  app.command(
    "/release-risk",
    handleReleaseRisk
  );
}