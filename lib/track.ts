"use client";

import { track as vercelTrack } from "@vercel/analytics";
import { getStoredAttribution } from "@/hooks/use-attribution";

export type ClientEventName =
  | "generation_requested"
  | "generation_success"
  | "generation_failure"
  | "rate_limit_hit"
  | "copy_click"
  | "shuffle_click"
  | "upgrade_cta_click"
  | "history_select";

/**
 * Fires a product analytics event via Vercel Web Analytics (works
 * automatically once deployed on Vercel, no extra API key required) and
 * enriches it with first-touch UTM attribution so campaign performance can
 * be measured per event, not just per pageview.
 */
export function trackEvent(name: ClientEventName, props: Record<string, string | number | boolean> = {}) {
  try {
    const attribution = getStoredAttribution();
    vercelTrack(name, {
      ...props,
      utm_source: attribution?.utm_source ?? "direct",
      utm_medium: attribution?.utm_medium ?? "none",
      utm_campaign: attribution?.utm_campaign ?? "none",
    });
  } catch {
    // Analytics must never break the core product experience.
  }
}
