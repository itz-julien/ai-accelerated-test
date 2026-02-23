// Convert UI messages (parts format) to model messages (content format)
// The AI SDK v6 client sends messages with `parts` array,
// but streamText/generateText expect `{ role, content }`.

interface UIPart {
  type: string;
  text?: string;
}

interface UIMsg {
  role: string;
  content?: string;
  parts?: UIPart[];
}

export interface ModelMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export function toModelMessages(messages: UIMsg[]): ModelMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => {
      let content = "";
      if (m.content) {
        content = m.content;
      } else if (m.parts) {
        content = m.parts
          .filter((p) => p.type === "text" && p.text)
          .map((p) => p.text!)
          .join("");
      }
      return {
        role: m.role as "user" | "assistant",
        content,
      };
    })
    .filter((m) => m.content.length > 0);
}
