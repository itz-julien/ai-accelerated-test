import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export type ModelId = "gpt-4o" | "claude-sonnet" | "gemini-pro";

export interface ModelConfig {
  id: ModelId;
  name: string;
  provider: string;
  color: string;
  icon: string;
}

export const MODELS: Record<ModelId, ModelConfig> = {
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    color: "#10a37f",
    icon: "⚡",
  },
  "claude-sonnet": {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    color: "#d97706",
    icon: "🧠",
  },
  "gemini-pro": {
    id: "gemini-pro",
    name: "Gemini Pro",
    provider: "Google",
    color: "#4285f4",
    icon: "✨",
  },
};

export function getModel(modelId: ModelId) {
  switch (modelId) {
    case "gpt-4o":
      return openai("gpt-4o");
    case "claude-sonnet":
      return anthropic("claude-sonnet-4-20250514");
    case "gemini-pro":
      return google("gemini-2.0-flash");
    default:
      throw new Error(`Unknown model: ${modelId}`);
  }
}

export const MODEL_LIST = Object.values(MODELS);
