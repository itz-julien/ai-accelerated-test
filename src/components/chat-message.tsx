"use client";

import { cn } from "@/lib/utils";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  model?: string;
  color?: string;
}

export function ChatMessage({ role, content, model, color }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "px-4 py-3 font-mono text-sm",
        role === "user"
          ? "bg-zinc-900/50 border-l-2 border-zinc-600"
          : "bg-zinc-950 border-l-2"
      )}
      style={
        role === "assistant" && color
          ? { borderLeftColor: color }
          : undefined
      }
    >
      <div className="flex items-center gap-2 mb-1">
        <span
          className={cn(
            "text-[10px] uppercase tracking-wider font-bold",
            role === "user" ? "text-zinc-500" : "text-zinc-400"
          )}
          style={role === "assistant" && color ? { color } : undefined}
        >
          {role === "user" ? "> you" : `< ${model || "ai"}`}
        </span>
      </div>
      <div className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  );
}
