export type PromptTone =
  | "professional"
  | "casual"
  | "funny"
  | "cinematic"
  | "technical"
  | "creative";

export interface GeneratedPrompt {
  id: string;
  title: string;
  prompt: string;
  tag: string;
}

export type GenerationSource = "claude" | "builtin";

export interface GenerateRequest {
  topic: string;
  tone: PromptTone;
  variant?: number;
}

export interface GenerateResponse {
  prompts: GeneratedPrompt[];
  source: GenerationSource;
}

export interface HistoryEntry {
  id: string;
  topic: string;
  tone: PromptTone;
  prompts: GeneratedPrompt[];
  createdAt: string;
}
