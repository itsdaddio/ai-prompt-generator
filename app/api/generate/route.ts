import { NextResponse } from "next/server";
import { generatePrompts } from "@/lib/promptEngine";
import { generatePromptsWithClaude, isClaudeConfigured } from "@/lib/claudeGenerate";
import { checkRateLimit, getClientIdentifier } from "@/lib/rateLimit";
import { hashIdentifier, logServerEvent } from "@/lib/analytics-events";
import { GenerateRequest, PromptTone } from "@/types";

const VALID_TONES: PromptTone[] = [
  "professional",
  "casual",
  "funny",
  "cinematic",
  "technical",
  "creative",
];

const MAX_TOPIC_LENGTH = 500;
const MAX_VARIANT = 50; // Guards against pathological/looping clients.

export async function POST(request: Request) {
  const clientId = getClientIdentifier(request);
  const clientIdHash = hashIdentifier(clientId);

  // --- Rate limiting (server-side, cannot be bypassed by editing the client) ---
  const rateLimit = checkRateLimit(clientId);
  if (!rateLimit.allowed) {
    logServerEvent({ event: "rate_limit_hit", clientIdHash });
    return NextResponse.json(
      {
        error: "You've reached today's free generation limit. Please try again tomorrow.",
        rateLimit: {
          limit: rateLimit.limit,
          remaining: 0,
          resetAt: rateLimit.resetAt,
        },
      },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      }
    );
  }

  // --- Request parsing & validation ---
  let body: Partial<GenerateRequest>;
  try {
    body = await request.json();
  } catch {
    logServerEvent({ event: "invalid_request", clientIdHash, errorMessage: "Invalid JSON body" });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const topic = (body.topic ?? "").toString().trim();
  const tone = VALID_TONES.includes(body.tone as PromptTone)
    ? (body.tone as PromptTone)
    : "professional";
  const rawVariant = Number(body.variant);
  const variant = Number.isFinite(rawVariant) ? Math.min(Math.max(rawVariant, 0), MAX_VARIANT) : 0;

  if (!topic) {
    logServerEvent({ event: "invalid_request", clientIdHash, errorMessage: "Empty topic" });
    return NextResponse.json({ error: "Please provide a topic." }, { status: 400 });
  }

  if (topic.length > MAX_TOPIC_LENGTH) {
    logServerEvent({ event: "invalid_request", clientIdHash, errorMessage: "Topic too long" });
    return NextResponse.json(
      { error: `Topic is too long. Please keep it under ${MAX_TOPIC_LENGTH} characters.` },
      { status: 400 }
    );
  }

  logServerEvent({
    event: "generation_requested",
    clientIdHash,
    tone,
    variant,
    topicLength: topic.length,
  });

  // --- Generation (Claude live, with automatic fallback to the built-in engine) ---
  if (isClaudeConfigured()) {
    try {
      const prompts = await generatePromptsWithClaude(topic, tone, variant);
      logServerEvent({ event: "generation_success", clientIdHash, source: "claude", tone, variant });
      return NextResponse.json(
        { prompts, source: "claude" },
        {
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        }
      );
    } catch (err) {
      // Fall through to the built-in generator so the app stays usable even
      // if the API key is invalid, rate-limited upstream, or the network
      // fails. This failure does NOT count against the user's rate limit
      // twice — the limit was already consumed once above, by design (it
      // protects against retries as much as successes).
      logServerEvent({
        event: "generation_failure",
        clientIdHash,
        source: "claude",
        tone,
        variant,
        errorMessage: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const prompts = generatePrompts(topic, tone, variant);
  logServerEvent({ event: "generation_success", clientIdHash, source: "builtin", tone, variant });
  return NextResponse.json(
    { prompts, source: "builtin" },
    {
      headers: {
        "X-RateLimit-Limit": String(rateLimit.limit),
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      },
    }
  );
}
