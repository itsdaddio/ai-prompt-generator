import { PromptGenerator } from "@/components/prompt-generator";
import { SiteFooter } from "@/components/site-footer";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-background to-muted/30 px-4 py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">AI Prompt Generator</h1>
        <p className="mt-3 text-muted-foreground">
          Type any topic — a sentence or a few keywords — and get the <strong>top 5 ready-to-use
          AI chatbot prompts</strong>, tailored to your tone. Built for marketers, creators, and
          anyone who wants better ChatGPT/Claude results without the trial and error.
        </p>
      </div>
      <PromptGenerator />
      <SiteFooter />
    </main>
  );
}
