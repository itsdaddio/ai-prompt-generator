/**
 * Server-side analytics/observability logging.
 *
 * Emits structured JSON log lines (readable by Vercel's log drain / any log
 * aggregator) for the events the product needs to measure. Deliberately
 * avoids logging API keys, full prompt text, or other unnecessary user
 * content — only the metadata needed to diagnose issues and measure usage.
 */

export type ServerEventName =
  | "generation_requested"
  | "generation_success"
  | "generation_failure"
  | "rate_limit_hit"
  | "invalid_request";

interface ServerEventPayload {
  event: ServerEventName;
  source?: "claude" | "builtin";
  tone?: string;
  topicLength?: number;
  variant?: number;
  errorMessage?: string;
  clientIdHash?: string;
  [key: string]: unknown;
}

/**
 * Cheap non-reversible identifier for grouping rate-limit/usage logs without
 * storing raw IP addresses in log output.
 */
export function hashIdentifier(value: string): string {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

export function logServerEvent(payload: ServerEventPayload) {
  const { errorMessage, ...rest } = payload;
  const entry = {
    ts: new Date().toISOString(),
    ...rest,
    // Truncate defensively in case an error message ever contains
    // unexpectedly large content.
    ...(errorMessage ? { errorMessage: errorMessage.slice(0, 300) } : {}),
  };
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(entry));
}
