"use client";

import { MODEL_LIST, type ModelId } from "@/lib/models";
import { cn } from "@/lib/utils";

interface ModelSelectorProps {
  selectedModel: ModelId;
  onSelect: (model: ModelId) => void;
  supervisorMode: boolean;
  onToggleSupervisor: () => void;
}

export function ModelSelector({
  selectedModel,
  onSelect,
  supervisorMode,
  onToggleSupervisor,
}: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b border-zinc-800 bg-zinc-950/80">
      {MODEL_LIST.map((model) => (
        <button
          key={model.id}
          onClick={() => onSelect(model.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer",
            selectedModel === model.id && !supervisorMode
              ? "text-white shadow-lg"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          )}
          style={
            selectedModel === model.id && !supervisorMode
              ? {
                  backgroundColor: `${model.color}20`,
                  borderColor: model.color,
                  border: `1px solid ${model.color}`,
                  boxShadow: `0 0 10px ${model.color}30`,
                }
              : undefined
          }
        >
          <span>{model.icon}</span>
          <span>{model.name}</span>
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ backgroundColor: model.color }}
          />
        </button>
      ))}

      <div className="ml-auto">
        <button
          onClick={onToggleSupervisor}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono transition-all cursor-pointer",
            supervisorMode
              ? "bg-purple-500/20 border border-purple-500 text-purple-300 shadow-lg shadow-purple-500/20"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          )}
        >
          <span>👑</span>
          <span>Supervisor</span>
        </button>
      </div>
    </div>
  );
}
