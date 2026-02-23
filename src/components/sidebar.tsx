"use client";

import { useState, useEffect } from "react";
import { MODEL_LIST } from "@/lib/models";
import { cn } from "@/lib/utils";
import { MessageSquare, LogOut, Zap, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Chat {
  id: string;
  title: string;
  model: string;
  is_supervisor: boolean;
  updated_at: string;
}

interface SidebarProps {
  onLogout: () => void;
  activeChatId: string | null;
  onSelectChat: (chatId: string | null) => void;
  refreshKey: number;
}

export function Sidebar({
  onLogout,
  activeChatId,
  onSelectChat,
  refreshKey,
}: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    loadChats();
  }, [refreshKey]);

  const loadChats = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.chats) setChats(data.chats);
    } catch {
      // Tables might not exist yet
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fetch(`/api/history/${chatId}`, { method: "DELETE" });
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) onSelectChat(null);
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-emerald-400" />
          <span className="font-mono font-bold text-sm text-zinc-100">
            AI CMD CENTER
          </span>
        </div>
        <p className="text-[10px] font-mono text-zinc-600 mt-1">
          v1.0.0 — Multi-Model Interface
        </p>
      </div>

      {/* Models Status */}
      <div className="p-3 border-b border-zinc-800">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
          Connected Models
        </p>
        {MODEL_LIST.map((model) => (
          <div
            key={model.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded text-xs font-mono text-zinc-400"
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: model.color }}
            />
            <span>{model.name}</span>
            <span className="ml-auto text-[10px] text-zinc-600">ONLINE</span>
          </div>
        ))}
      </div>

      {/* New Chat */}
      <div className="p-3 border-b border-zinc-800">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs font-mono gap-2"
          onClick={() => onSelectChat(null)}
        >
          <Plus className="h-3.5 w-3.5" />
          New Chat
        </Button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-3">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
          History
        </p>
        {chats.length === 0 && (
          <p className="text-[10px] font-mono text-zinc-700 px-2">
            No chats yet
          </p>
        )}
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat(chat.id)}
            className={cn(
              "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer group mb-0.5",
              activeChatId === chat.id
                ? "bg-zinc-800/50 text-zinc-200"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
            )}
          >
            <MessageSquare className="h-3 w-3 shrink-0" />
            <span className="truncate flex-1 text-left">{chat.title}</span>
            <Trash2
              className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-400 transition-opacity"
              onClick={(e) => deleteChat(chat.id, e)}
            />
          </button>
        ))}
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-zinc-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-xs font-mono gap-2"
          onClick={onLogout}
        >
          <LogOut className="h-3.5 w-3.5" />
          Disconnect
        </Button>
      </div>
    </div>
  );
}
