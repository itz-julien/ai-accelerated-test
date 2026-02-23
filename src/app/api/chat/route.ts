import { streamText } from "ai";
import { getModel, type ModelId } from "@/lib/models";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages, model: modelId } = await req.json();

  const result = streamText({
    model: getModel(modelId as ModelId),
    system:
      "You are a helpful AI assistant in a multi-model command center. Be concise, accurate, and helpful. Format responses with markdown when appropriate.",
    messages,
  });

  return result.toTextStreamResponse();
}
