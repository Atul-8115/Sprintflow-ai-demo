import { runAgent } from '../agent/agent.js';
import { buildSummaryBlocks } from '../utils/buildSummaryBlocks.js';
import { generateInsight } from '../utils/generateInsights.js';

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
}