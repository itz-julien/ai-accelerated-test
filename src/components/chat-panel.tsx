"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MODELS, type ModelId } from "@/lib/models";
import { Send, Square, Trash2 } from "lucide-react";

const MAX_MESSAGES = 10;

interface ChatPanelProps {
  activeChatId: string | null;
  onChatCreated: (chatId: string) => void;
  selectedModel: ModelId;
}

export function ChatPanel({
  activeChatId,
  onChatCreated,
  selectedModel,
}: ChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [atLimit, setAtLimit] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { model: selectedModel },
      }),
    [selectedModel]
  );

  const { messages, sendMessage, stop, setMessages, status } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (!activeChatId) {
      setMessages([]);
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/history/${activeChatId}`);
        const data = await res.json();
        if (data.messages) {
          const uiMessages = data.messages.map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role,
              parts: [{ type: "text" as const, text: m.content }],
            })
          );
          setMessages(uiMessages);
        }
      } catch {
        // Tables might not exist yet
      }
    })();
  }, [activeChatId, setMessages]);

  useEffect(() => {
    setAtLimit(messages.length >= MAX_MESSAGES);
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessage = useCallback(
    async (chatId: string, role: string, content: string, model?: string) => {
      try {
        await fetch(`/api/history/${chatId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role, content, model }),
        });
      } catch {
        // Silent fail
      }
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || atLimit) return;

    let chatId = activeChatId;

    if (!chatId) {
      try {
        const res = await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: selectedModel, is_supervisor: false }),
        });
        const data = await res.json();
        if (data.chat) {
          chatId = data.chat.id;
          onChatCreated(chatId!);
        }
      } catch {
        // Still allow chatting without persistence
      }
    }

    const userText = inputValue;
    setInputValue("");
    sendMessage({ text: userText });

    if (chatId) {
      await saveMessage(chatId, "user", userText);
    }
  };

  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current === "streaming" && status === "ready") {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.role === "assistant" && activeChatId) {
        const content =
          lastMsg.parts
            ?.filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join("") || "";
        if (content) {
          saveMessage(activeChatId, "assistant", content, selectedModel);
        }
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, activeChatId, selectedModel, saveMessage]);

  const currentModel = MODELS[selectedModel];

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-600">
              <div className="text-6xl mb-4">{currentModel.icon}</div>
              <p className="font-mono text-sm">
                Connected to {currentModel.name}
              </p>
              <p className="font-mono text-xs text-zinc-700 mt-1">
                Type a message to begin...
              </p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role as "user" | "assistant"}
              content={
                message.parts
                  ?.filter((p) => p.type === "text")
                  .map((p) => (p as { type: "text"; text: string }).text)
                  .join("") || ""
              }
              model={
                message.role === "assistant" ? currentModel.name : undefined
              }
              color={
                message.role === "assistant" ? currentModel.color : undefined
              }
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="px-4 py-3 font-mono text-sm">
              <span
                className="text-[10px] uppercase tracking-wider font-bold animate-pulse"
                style={{ color: currentModel.color }}
              >
                {"< "}
                {currentModel.name} thinking...
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-950/80">
        {atLimit && (
          <div className="mb-2 px-3 py-1.5 bg-amber-950/50 border border-amber-800/50 rounded text-amber-400 text-xs font-mono">
            Message limit reached ({MAX_MESSAGES}). Start a new chat to
            continue.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
              &gt;
            </div>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                atLimit
                  ? "Message limit reached..."
                  : `Ask ${currentModel.name}...`
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-4 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              disabled={isLoading || atLimit}
            />
          </div>

          {isLoading ? (
            <Button type="button" variant="outline" size="icon" onClick={stop}>
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
            onClick={() => setMessages([])}
            title="Clear chat"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-zinc-600">
          <span
            className="flex items-center gap-1"
            style={{ color: currentModel.color }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: currentModel.color }}
            />
            {currentModel.provider.toUpperCase()}
          </span>
          <span>|</span>
          <span>MODEL: {currentModel.id.toUpperCase()}</span>
          <span>|</span>
          <span>
            MSGS: {messages.length}/{MAX_MESSAGES}
          </span>
        </div>
      </div>
    </div>
  );
}
