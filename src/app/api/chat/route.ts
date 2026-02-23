import { streamText } from "ai";
import { getModel, type ModelId } from "@/lib/models";

const MAX_MESSAGES = 10;

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model: modelId } = await req.json();

  // Limit context to last MAX_MESSAGES to control token usage
  const trimmedMessages = messages.slice(-MAX_MESSAGES);

  const result = streamText({
    model: getModel(modelId as ModelId),
    system:
      "You are a helpful AI assistant in a multi-model command center. Be concise, accurate, and helpful. Format responses with markdown when appropriate.",
    messages: trimmedMessages,
  });

  return result.toTextStreamResponse();
}
