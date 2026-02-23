import { generateText } from "ai";
import { getModel, ONLINE_MODELS } from "@/lib/models";
import { toModelMessages } from "@/lib/messages";
import { NextResponse } from "next/server";

const MAX_MESSAGES = 10;

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const modelMessages = toModelMessages(messages).slice(-MAX_MESSAGES);

  // Fan out to all models in parallel
  const results = await Promise.allSettled(
    ONLINE_MODELS.map(async (model) => {
      const result = await generateText({
        model: getModel(model.id),
        system:
          "You are a helpful AI assistant. Be concise and accurate. Respond in 2-3 paragraphs max.",
        messages: modelMessages,
      });
      return {
        modelId: model.id,
        name: model.name,
        color: model.color,
        icon: model.icon,
        text: result.text,
      };
    })
  );

  const responses = results.map((r, i) => {
    if (r.status === "fulfilled") {
      return { ...r.value, error: null };
    }
    return {
      modelId: ONLINE_MODELS[i].id,
      name: ONLINE_MODELS[i].name,
      color: ONLINE_MODELS[i].color,
      icon: ONLINE_MODELS[i].icon,
      text: null,
      error: (r.reason as Error)?.message || "Failed to respond",
    };
  });

  return NextResponse.json({ responses });
}
