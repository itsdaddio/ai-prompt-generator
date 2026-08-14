"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, AlertCircle, Shuffle, Zap, Clock } from "lucide-react";
import { PromptResultCard } from "@/components/prompt-result-card";
import { PromptHistoryPanel } from "@/components/prompt-history-panel";
import { GeneratedPrompt, GenerationSource, HistoryEntry, PromptTone } from "@/types";
import { TONE_OPTIONS } from "@/lib/promptEngine";
import { usePromptHistory } from "@/hooks/use-prompt-history";
import { trackEvent } from "@/lib/track";

const EXAMPLE_TOPICS = [
  "launching a small coffee brand",
  "learning to play guitar as an adult",
  "productivity, focus, deep work",
  "training for a first marathon",
];

export function PromptGenerator() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<PromptTone>("professional");
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([]);
  const [source, setSource] = useState<GenerationSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const variantRef = useRef(0);

  const { history, addEntry, removeEntry, clearHistory } = usePromptHistory();

  const runGenerate = useCallback(
    async (targetTopic: string, targetTone: PromptTone, variant: number, save: boolean) => {
      if (!targetTopic.trim()) {
        setError("Please enter a topic, sentence, or a few keywords first.");
        return;
      }
      setLoading(true);
      setError(null);
      setRateLimited(false);
      trackEvent("generation_requested", { tone: targetTone, variant });
      try {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic: targetTopic, tone: targetTone, variant }),
        });
        const data = await res.json();

        const remainingHeader = res.headers.get("X-RateLimit-Remaining");
        if (remainingHeader !== null) setRemaining(Number(remainingHeader));

        if (res.status === 429) {
          setRateLimited(true);
          trackEvent("rate_limit_hit", { tone: targetTone });
          throw new Error(data?.error ?? "You've reached today's free generation limit.");
        }

        if (!res.ok) {
          throw new Error(data?.error ?? "Something went wrong generating prompts.");
        }

        const results: GeneratedPrompt[] = data.prompts ?? [];
        setPrompts(results);
        setSource((data.source as GenerationSource) ?? "builtin");
        setHasGenerated(true);
        trackEvent("generation_success", { tone: targetTone, source: data.source ?? "builtin" });
        if (save) addEntry(targetTopic.trim(), targetTone, results);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Something went wrong.";
        setError(message);
        trackEvent("generation_failure", { tone: targetTone, message: message.slice(0, 80) });
      } finally {
        setLoading(false);
      }
    },
    [addEntry]
  );

  const handleGenerate = useCallback(() => {
    variantRef.current = 0;
    runGenerate(topic, tone, 0, true);
  }, [topic, tone, runGenerate]);

  const handleShuffle = useCallback(() => {
    variantRef.current += 1;
    trackEvent("shuffle_click", { tone });
    runGenerate(topic, tone, variantRef.current, true);
  }, [topic, tone, runGenerate]);

  const handleSelectHistory = useCallback((entry: HistoryEntry) => {
    setTopic(entry.topic);
    setTone(entry.tone);
    setPrompts(entry.prompts);
    setHasGenerated(true);
    setError(null);
    setRateLimited(false);
    setSource(null);
    variantRef.current = 0;
    trackEvent("history_select", { tone: entry.tone });
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8">
      <Card>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="topic">Your topic</Label>
            <Textarea
              id="topic"
              placeholder="Describe a topic in a sentence or two, or drop a few keywords — e.g. &quot;launching a small coffee brand&quot;"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {EXAMPLE_TOPICS.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setTopic(example)}
                  className="rounded-full border border-muted-foreground/20 px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone / style</Label>
            <Select value={tone} onValueChange={(value) => setTone(value as PromptTone)}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Choose a tone" />
              </SelectTrigger>
              <SelectContent>
                {TONE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant={rateLimited ? "default" : "destructive"}>
              {rateLimited ? <Clock className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={loading || rateLimited}
              className="flex-1 gap-2"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate top 5 prompts
                </>
              )}
            </Button>
            {hasGenerated && (
              <Button
                onClick={handleShuffle}
                disabled={loading || rateLimited}
                variant="outline"
                size="lg"
                className="gap-2"
                title="Get a different set of 5 prompts for the same topic"
              >
                <Shuffle className="h-4 w-4" />
                Shuffle
              </Button>
            )}
          </div>

          {remaining !== null && remaining <= 3 && !rateLimited && (
            <p className="text-center text-xs text-muted-foreground">
              {remaining} free generation{remaining === 1 ? "" : "s"} left today
            </p>
          )}
        </CardContent>
      </Card>

      {loading && (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      )}

      {!loading && prompts.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Top 5 AI prompts for &quot;{topic.trim()}&quot;
            </h2>
            {source === "claude" && (
              <Badge variant="secondary" className="gap-1 text-xs font-normal">
                <Zap className="h-3 w-3" /> Live via Claude
              </Badge>
            )}
          </div>
          {prompts.map((prompt, index) => (
            <PromptResultCard key={prompt.id} prompt={prompt} index={index} />
          ))}
        </div>
      )}

      <PromptHistoryPanel
        history={history}
        onSelect={handleSelectHistory}
        onRemove={removeEntry}
        onClear={clearHistory}
      />
    </div>
  );
}
