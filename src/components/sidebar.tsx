"use client";

import { MODEL_LIST } from "@/lib/models";
import { cn } from "@/lib/utils";
import { MessageSquare, Settings, LogOut, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
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

      {/* Nav */}
      <div className="flex-1 p-3">
        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-2">
          Navigation
        </p>
        <button
          className={cn(
            "flex items-center gap-2 w-full px-2 py-1.5 rounded text-xs font-mono transition-colors cursor-pointer",
            "bg-zinc-800/50 text-zinc-200"
          )}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </button>
      </div>

      {/* Bottom */}
      <div className="p-3 border-t border-zinc-800 space-y-1">
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
