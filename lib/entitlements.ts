/**
 * Monetization / entitlement architecture (structural scaffold only).
 *
 * No billing is wired up yet — no payment provider is connected in this
 * project, and per project rules we do not invent pricing or activate paid
 * billing without that infrastructure already existing. This file exists so
 * that adding a real "Pro" tier later (via Stripe, or ItsDad's existing
 * billing/entitlement system if one exists) is a small, additive change
 * rather than an architectural rewrite.
 */

export type PlanTier = "free" | "pro";

export interface PlanLimits {
  dailyGenerations: number;
  liveModelAccess: boolean;
  historySync: boolean;
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    dailyGenerations: Number.parseInt(process.env.FREE_DAILY_GENERATION_LIMIT ?? "10", 10),
    liveModelAccess: true, // Currently: everyone gets live Claude generation
    // with an automatic built-in fallback. When a paid tier is introduced,
    // this is the flag to gate on.
    historySync: false, // Local-only today; cross-device sync is a Pro hook.
  },
  pro: {
    dailyGenerations: Number.parseInt(process.env.PRO_DAILY_GENERATION_LIMIT ?? "500", 10),
    liveModelAccess: true,
    historySync: true,
  },
};

/**
 * Placeholder resolver — currently everyone resolves to "free" because no
 * auth/billing system is wired up. Swap the implementation once accounts
 * and a payment provider exist (Stripe, or an existing ItsDad entitlement
 * system) — the rest of the app already reads limits through this function.
 */
export function resolvePlanTier(): PlanTier {
  return "free";
}

export function getLimitsForCurrentUser(): PlanLimits {
  return PLAN_LIMITS[resolvePlanTier()];
}
