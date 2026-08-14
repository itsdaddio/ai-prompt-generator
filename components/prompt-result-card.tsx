"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { GeneratedPrompt } from "@/types";
import { trackEvent } from "@/lib/track";

interface PromptResultCardProps {
  prompt: GeneratedPrompt;
  index: number;
}

export function PromptResultCard({ prompt, index }: PromptResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      trackEvent("copy_click", { tag: prompt.tag, position: index + 1 });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — silently ignore.
    }
  };

  return (
    <Card className="border-muted-foreground/10 transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="flex items-start gap-3">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {index + 1}
          </div>
          <div>
            <CardTitle className="text-base leading-snug">{prompt.title}</CardTitle>
            <Badge variant="secondary" className="mt-1.5 text-xs font-normal">
              {prompt.tag}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="shrink-0 gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{prompt.prompt}</p>
      </CardContent>
    </Card>
  );
}
