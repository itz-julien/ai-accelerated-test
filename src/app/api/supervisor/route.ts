import { streamText, generateText } from "ai";
import { getModel, MODEL_LIST } from "@/lib/models";

const MAX_MESSAGES = 10;

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Limit context to last MAX_MESSAGES
  const trimmedMessages = messages.slice(-MAX_MESSAGES);
  const userMessage = trimmedMessages[trimmedMessages.length - 1]?.content || "";

  // Fan out to all models in parallel
  const results = await Promise.allSettled(
    MODEL_LIST.map(async (model) => {
      const result = await generateText({
        model: getModel(model.id),
        system:
          "You are a helpful AI assistant. Be concise and accurate. Respond in 2-3 paragraphs max.",
        messages: trimmedMessages,
      });
      return { model: model.id, name: model.name, text: result.text };
    })
  );

  const responses = results
    .filter((r) => r.status === "fulfilled")
    .map(
      (r) =>
        (r as PromiseFulfilledResult<{ model: string; name: string; text: string }>).value
    );

  const failedModels = results
    .map((r, i) => (r.status === "rejected" ? MODEL_LIST[i].name : null))
    .filter(Boolean);

  const synthesisPrompt = `You are the Supervisor AI — the master orchestrator in an AI Command Center.

You received the following responses from different AI models to this user query: "${userMessage}"

${responses.map((r) => `### ${r.name}\n${r.text}`).join("\n\n")}

${failedModels.length > 0 ? `\nNote: ${failedModels.join(", ")} failed to respond.\n` : ""}

Your job:
1. Synthesize the best answer from all responses
2. Note where models agree or disagree
3. Provide the most accurate, comprehensive answer
4. Be concise — this is a command center, not an essay contest

Format your response with clear sections. Start with your synthesized answer, then add a brief "Model Agreement" section at the end.`;

  const supervisorResult = streamText({
    model: getModel("gpt-4o"),
    messages: [{ role: "user", content: synthesisPrompt }],
  });

  return supervisorResult.toTextStreamResponse();
}
