"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect, useMemo } from "react";
import { ModelSelector } from "./model-selector";
import { ChatMessage } from "./chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { MODELS, type ModelId } from "@/lib/models";
import { Send, Square, Trash2 } from "lucide-react";

export function ChatPanel() {
  const [selectedModel, setSelectedModel] = useState<ModelId>("gpt-4o");
  const [supervisorMode, setSupervisorMode] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: supervisorMode ? "/api/supervisor" : "/api/chat",
        body: { model: selectedModel },
      }),
    [supervisorMode, selectedModel]
  );

  const { messages, sendMessage, stop, setMessages, status } = useChat({
    transport,
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const currentModel = MODELS[selectedModel];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      <ModelSelector
        selectedModel={selectedModel}
        onSelect={(m) => {
          setSelectedModel(m);
          setSupervisorMode(false);
        }}
        supervisorMode={supervisorMode}
        onToggleSupervisor={() => setSupervisorMode(!supervisorMode)}
      />

      {/* Messages */}
      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-zinc-600">
              <div className="text-6xl mb-4">
                {supervisorMode ? "👑" : currentModel.icon}
              </div>
              <p className="font-mono text-sm">
                {supervisorMode
                  ? "Supervisor Mode — All models will be queried"
                  : `Connected to ${currentModel.name}`}
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
                message.role === "assistant"
                  ? supervisorMode
                    ? "Supervisor"
                    : currentModel.name
                  : undefined
              }
              color={
                message.role === "assistant"
                  ? supervisorMode
                    ? "#a855f7"
                    : currentModel.color
                  : undefined
              }
            />
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="px-4 py-3 font-mono text-sm">
              <span
                className="text-[10px] uppercase tracking-wider font-bold animate-pulse"
                style={{
                  color: supervisorMode ? "#a855f7" : currentModel.color,
                }}
              >
                {supervisorMode
                  ? "< supervisor thinking..."
                  : `< ${currentModel.name} thinking...`}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-950/80">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-mono text-sm">
              &gt;
            </div>
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={
                supervisorMode
                  ? "Ask all models at once..."
                  : `Ask ${currentModel.name}...`
              }
              className="w-full bg-zinc-900 border border-zinc-800 rounded-md pl-7 pr-4 py-2.5 text-sm text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600"
              disabled={isLoading}
            />
          </div>

          {isLoading ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={stop}
            >
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" variant="outline" size="icon">
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
            style={{
              color: supervisorMode ? "#a855f7" : currentModel.color,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{
                backgroundColor: supervisorMode
                  ? "#a855f7"
                  : currentModel.color,
              }}
            />
            {supervisorMode
              ? "SUPERVISOR"
              : currentModel.provider.toUpperCase()}
          </span>
          <span>|</span>
          <span>
            MODEL: {supervisorMode ? "ALL" : currentModel.id.toUpperCase()}
          </span>
          <span>|</span>
          <span>STREAM: ACTIVE</span>
        </div>
      </div>
    </div>
  );
}
