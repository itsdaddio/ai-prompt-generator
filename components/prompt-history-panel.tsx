"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash, X } from "lucide-react";
import { HistoryEntry } from "@/types";
import { getToneLabel } from "@/lib/promptEngine";

interface PromptHistoryPanelProps {
  history: HistoryEntry[];
  onSelect: (entry: HistoryEntry) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  return `${diffDay}d ago`;
}

export function PromptHistoryPanel({ history, onSelect, onRemove, onClear }: PromptHistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className="h-4 w-4" /> Recent generations
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClear} className="h-7 gap-1 text-xs text-muted-foreground">
          <Trash className="h-3.5 w-3.5" /> Clear all
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center justify-between gap-2 rounded-md border border-muted-foreground/10 px-3 py-2 text-left transition-colors hover:bg-accent"
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
            >
              <span className="truncate text-sm">{entry.topic}</span>
              <Badge variant="outline" className="shrink-0 text-xs font-normal">
                {getToneLabel(entry.tone)}
              </Badge>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatRelativeTime(entry.createdAt)}
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRemove(entry.id)}
              className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              aria-label="Remove from history"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
