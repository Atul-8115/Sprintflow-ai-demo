import { handleFeedbackButton } from './feedback-buttons.js';
import {
  handleGenerateRisks,
  handleViewDetails,
  handleSummarizeThread,
} from './sprint-actions.js';

/**
 * Register action listeners with the Bolt app.
 * @param {import('@slack/bolt').App} app
 * @returns {void}
 */
export function register(app) {
  app.action('feedback', handleFeedbackButton);

  app.action('generate_risks', handleGenerateRisks);

  app.action('view_details', handleViewDetails);

  app.action('summarize_thread', handleSummarizeThread);
}