"use client";

import { MODEL_LIST, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";
import { Crown, Lock } from "lucide-react";

interface ModelBarProps {
  selectedModel: ModelId;
  onSelectModel: (model: ModelId) => void;
  supervisorMode: boolean;
  onToggleSupervisor: () => void;
  locked: boolean;
}

export function ModelBar({
  selectedModel,
  onSelectModel,
  supervisorMode,
  onToggleSupervisor,
  locked,
}: ModelBarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-950/80">
      {/* Supervisor first */}
      <button
        onClick={onToggleSupervisor}
        disabled={locked && !supervisorMode}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all",
          locked && !supervisorMode
            ? "text-zinc-700 cursor-not-allowed opacity-50"
            : supervisorMode
              ? "text-white shadow-lg bg-purple-500/20 border border-purple-500 cursor-pointer"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 cursor-pointer"
        )}
        style={
          supervisorMode
            ? { boxShadow: "0 0 10px #a855f730" }
            : undefined
        }
      >
        <Crown className="h-3.5 w-3.5" />
        <span>Supervisor</span>
        {supervisorMode && (
          <span className="w-2 h-2 rounded-full animate-pulse bg-purple-400" />
        )}
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-zinc-700" />

      {/* Individual models */}
      {MODEL_LIST.map((model) => {
        const isActive = selectedModel === model.id && !supervisorMode;
        const isDisabled = !model.online || (locked && !isActive);

        return (
          <button
            key={model.id}
            onClick={() => !isDisabled && onSelectModel(model.id)}
            disabled={isDisabled}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all",
              isDisabled
                ? "text-zinc-700 cursor-not-allowed opacity-50"
                : isActive
                  ? "text-white shadow-lg cursor-pointer"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 cursor-pointer"
            )}
            style={
              model.online && isActive
                ? {
                    backgroundColor: `${model.color}20`,
                    border: `1px solid ${model.color}`,
                    boxShadow: `0 0 10px ${model.color}30`,
                  }
                : undefined
            }
          >
            <span>{model.icon}</span>
            <span>{model.name}</span>
            {!model.online ? (
              <span className="text-[9px] uppercase tracking-wider text-zinc-600 font-bold">
                offline
              </span>
            ) : locked && !isActive ? (
              <Lock className="h-2.5 w-2.5 text-zinc-600" />
            ) : (
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ backgroundColor: model.color }}
              />
            )}
          </button>
        );
      })}

      {locked && (
        <span className="ml-auto text-[9px] font-mono text-zinc-600">
          <Lock className="h-2.5 w-2.5 inline mr-1" />
          LOCKED
        </span>
      )}
    </div>
  );
}
