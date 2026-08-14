"use client";

import { useCallback, useEffect, useState } from "react";
import { GeneratedPrompt, HistoryEntry, PromptTone } from "@/types";

const STORAGE_KEY = "ai-prompt-generator:history";
const MAX_ENTRIES = 20;

function readHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // Storage full or unavailable — fail silently, history is a nice-to-have.
  }
}

export function usePromptHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setHistory(readHistory());
    setLoaded(true);
  }, []);

  const addEntry = useCallback((topic: string, tone: PromptTone, prompts: GeneratedPrompt[]) => {
    setHistory((prev) => {
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        topic,
        tone,
        prompts,
        createdAt: new Date().toISOString(),
      };
      const next = [entry, ...prev].slice(0, MAX_ENTRIES);
      writeHistory(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((entry) => entry.id !== id);
      writeHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    writeHistory([]);
  }, []);

  return { history, loaded, addEntry, removeEntry, clearHistory };
}
