import { generateResponse } from '../gemini.js';

/**
 * Run the agent with Gemini
 */
export async function runAgent(text) {
    try {
      const systemPrompt = `
            You are SprintFlow AI.

            Generate concise engineering sprint summaries.

            Use EXACT sections:

            **Completed work**
            • item

            **In progress**
            • item

            **Blockers**
            • item

            **Next steps**
            • item

            Keep responses short and professional.
        `;

    const finalPrompt = `
        ${systemPrompt}

        User request:
        ${text} 
    `;

    const responseText = await generateResponse(finalPrompt);

    return {
      responseText,
      sessionId: null,
    };
  } catch (error) {
    console.error('Gemini Error:', error);

    return {
      responseText: 'Something went wrong while generating response.',
      sessionId: null,
    };
  }
}