"use client";

import { useFirstTouchAttribution } from "@/hooks/use-attribution";

/**
 * Mounted once in the root layout. Captures first-touch UTM/referrer
 * attribution on initial page load; renders nothing.
 */
export function AttributionInit() {
  useFirstTouchAttribution();
  return null;
}
