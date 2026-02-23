"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatSkeleton } from "./chat-skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Square, Trash2, Crown } from "lucide-react";
import {
  createChat,
  getChatMessages,
  saveMessage,
} from "@/lib/chat-history";

interface ModelResponse {
  modelId: string;
  name: string;
  color: string;
  icon: string;
  text: string | null;
  error: string | null;
}

interface ConversationEntry {
  id: string;
  userMessage: string;
  responses: ModelResponse[];
}

interface SupervisorPanelProps {
  activeChatId: string | null;
  onChatCreated: (chatId: string) => void;
  atLimit: boolean;
  globalMsgCount: number;
  maxMessages: number;
  onMessageSent: (count: number) => void;
}

export function SupervisorPanel({
  activeChatId,
  onChatCreated,
  atLimit,
  globalMsgCount,
  maxMessages,
  onMessageSent,
}: SupervisorPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [conversation, isLoading]);

  // Load history when activeChatId changes
  useEffect(() => {
    if (!activeChatId) {
      setConversation([]);
      setIsLoadingHistory(false);
      return;
    }
    setIsLoadingHistory(true);
    getChatMessages(activeChatId).then((msgs) => {
      const entries: ConversationEntry[] = [];
      for (let i = 0; i < msgs.length; i += 2) {
        const userMsg = msgs[i];
        const assistantMsg = msgs[i + 1];
        if (userMsg?.role === "user") {
          let responses: ModelResponse[] = [];
          if (assistantMsg?.role === "assistant") {
            try {
              responses = JSON.parse(assistantMsg.content);
            } catch {
              responses = [
                {
                  modelId: "saved",
                  name: "Supervisor",
                  color: "#a855f7",
                  icon: "👑",
                  text: assistantMsg.content,
                  error: null,
                },
              ];
            }
          }
          entries.push({
            id: userMsg.id,
            userMessage: userMsg.content,
            responses,
          });
        }
      }
      setConversation(entries);
      setIsLoadingHistory(false);
    });
  }, [activeChatId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || atLimit) return;

    const userMessage = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Ensure we have a chat
    let chatId = activeChatId;
    if (!chatId) {
      const chat = await createChat("supervisor", true);
      if (chat) {
        chatId = chat.id;
        onChatCreated(chatId);
      }
    }

    // Build message history for context
    const messages = conversation.flatMap((entry) => [
      { role: "user" as const, content: entry.userMessage },
      {
        role: "assistant" as const,
        content:
          entry.responses.find((r) => r.text)?.text ||
          "No response available.",
      },
    ]);
    messages.push({ role: "user" as const, content: userMessage });

    // Save user message
    if (chatId) {
      await saveMessage(chatId, "user", userMessage, "supervisor");
      onMessageSent(1);
    }

    try {
      const res = await fetch("/api/supervisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      const responses: ModelResponse[] = data.responses || [];

      setConversation((prev) => [
        ...prev,
        { id: crypto.randomUUID(), userMessage, responses },
      ]);

      // Save all model responses as a single JSON assistant message
      if (chatId) {
        await saveMessage(
          chatId,
          "assistant",
          JSON.stringify(responses),
          "supervisor"
        );
        onMessageSent(1);
      }
    } catch {
      const errorResponses: ModelResponse[] = [
        {
          modelId: "error",
          name: "System",
          color: "#ef4444",
          icon: "X",
          text: null,
          error: "Failed to reach the API",
        },
      ];
      setConversation((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          userMessage,
          responses: errorResponses,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Conversation */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
          {isLoadingHistory && <ChatSkeleton supervisor />}

          {!isLoadingHistory && conversation.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-zinc-600">
              <Crown className="h-16 w-16 mb-4 text-purple-500/30" />
              <p className="font-mono text-sm">Supervisor Mode Active</p>
              <p className="font-mono text-xs text-zinc-700 mt-1">
                Your prompt will be sent to all models simultaneously
              </p>
            </div>
          )}

          {conversation.map((entry) => (
            <div key={entry.id} className="space-y-3">
              {/* User message */}
              <div className="px-4 py-3 font-mono text-sm bg-zinc-900/50 border-l-2 border-zinc-600 rounded-r">
                <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-1">
                  &gt; you
                </div>
                <div className="text-zinc-300">{entry.userMessage}</div>
              </div>

              {/* Model responses side by side */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {entry.responses.map((response) => (
                  <div
                    key={response.modelId}
                    className="rounded-lg border bg-zinc-900/50 overflow-hidden"
                    style={{ borderColor: `${response.color}40` }}
                  >
                    <div
                      className="px-3 py-2 border-b flex items-center gap-2"
                      style={{
                        borderColor: `${response.color}40`,
                        backgroundColor: `${response.color}10`,
                      }}
                    >
                      <span>{response.icon}</span>
                      <span
                        className="font-mono text-xs font-bold"
                        style={{ color: response.color }}
                      >
                        {response.name}
                      </span>
                      <span
                        className="w-2 h-2 rounded-full ml-auto"
                        style={{
                          backgroundColor: response.error
                            ? "#ef4444"
                            : response.color,
                        }}
                      />
                    </div>
                    <div className="p-3 font-mono text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                      {response.error ? (
                        <span className="text-red-400">
                          Error: {response.error}
                        </span>
                      ) : (
                        response.text
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {["GPT-4o", "Claude Sonnet", "Gemini Pro"].map((name) => (
                <div
                  key={name}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
                >
                  <div className="font-mono text-xs text-zinc-500 animate-pulse">
                    {name} thinking...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-950/80">
        {atLimit && (
          <div className="mb-2 px-3 py-1.5 bg-amber-950/50 border border-amber-800/50 rounded text-amber-400 text-xs font-mono">
            Global message limit reached ({maxMessages}). No more messages
            allowed.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-mono text-sm">
              &gt;
            </div>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                atLimit
                  ? "Message limit reached..."
                  : "Ask all models at once..."
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-4 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              disabled={isLoading || atLimit}
            />
          </div>

          {isLoading ? (
            <Button type="button" variant="outline" size="icon" disabled>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={atLimit}
            >
              <Send className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setConversation([])}
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-zinc-600">
          <span className="flex items-center gap-1 text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-purple-400" />
            SUPERVISOR
          </span>
          <span>|</span>
          <span>MODELS: ALL</span>
          <span>|</span>
          <span>
            GLOBAL: {globalMsgCount}/{maxMessages}
          </span>
        </div>
      </div>
    </div>
  );
}
