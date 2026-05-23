import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generateResponse(prompt) {
  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    return completion.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Groq Error:", error);

    return `
**Completed work**
• AI response fallback activated

**In progress**
• Recovering inference service

**Blockers**
• External AI provider issue

**Next steps**
• Retry in a few seconds
`;
  }
}