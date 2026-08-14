"use client";

import { useEffect } from "react";

const ATTRIBUTION_KEY = "ai-prompt-generator:first-touch-attribution";

interface Attribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  referrer: string | null;
  landingPath: string | null;
  firstSeenAt: string;
}

/**
 * Captures first-touch UTM/referrer attribution on the very first visit and
 * persists it in localStorage so it survives normal in-app navigation (and
 * repeat visits within the same browser), without re-capturing on every
 * subsequent page view. This is the standard "first touch wins" model.
 */
export function useFirstTouchAttribution() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const existing = window.localStorage.getItem(ATTRIBUTION_KEY);
      if (existing) return; // Already captured — first touch wins.

      const params = new URLSearchParams(window.location.search);
      const attribution: Attribution = {
        utm_source: params.get("utm_source"),
        utm_medium: params.get("utm_medium"),
        utm_campaign: params.get("utm_campaign"),
        referrer: document.referrer || null,
        landingPath: window.location.pathname,
        firstSeenAt: new Date().toISOString(),
      };
      window.localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
    } catch {
      // localStorage unavailable (private mode, etc.) — attribution is a
      // nice-to-have, fail silently.
    }
  }, []);
}

export function getStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ATTRIBUTION_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
