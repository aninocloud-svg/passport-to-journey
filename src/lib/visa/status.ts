import type { Assessment, SearchInput, VisaRoute } from "./types";

export const NOT_VERIFIED = "Not verified yet";

/** True when the review_after date has passed (or the data was never checked). */
export function isStale(route: Pick<VisaRoute, "checked_at" | "review_after">, now: Date = new Date()): boolean {
  if (!route.checked_at) return true;
  if (!route.review_after) return true;
  return new Date(route.review_after).getTime() < now.getTime();
}

/**
 * Status rules — never guess:
 *  - green: verified, fresh, visa_free/simplified, trip within verified stay, no open conditions.
 *  - red:   verified, fresh, explicitly visa_required or ineligible.
 *  - amber: everything else (missing, conditional, stale, illustrative, unverified).
 */
export function assess(route: VisaRoute | null, input?: Pick<SearchInput, "duration">, now: Date = new Date()): Assessment {
  const reasons: string[] = [];
  if (!route) {
    return { status: "amber", reasons: ["No verified data for this combination yet."], stale: true, exceedsStay: false };
  }
  const stale = isStale(route, now);
  const verified = route.confidence === "verified" && !route.illustrative && !!route.source_url;
  const exceedsStay = !!input && route.stay_days != null && input.duration > route.stay_days;

  if (!verified) reasons.push(route.illustrative ? "Illustrative sample — not verified data." : "Source not verified.");
  if (stale) reasons.push("Data is past its review date or was never checked.");

  if (verified && !stale && (route.eligibility === "visa_required" || route.eligibility === "ineligible")) {
    return { status: "red", reasons: ["Verified source states a visa is required / not eligible for this route."], stale, exceedsStay };
  }

  if (route.eligibility === "conditional" || route.conditions.length > 0) reasons.push("Eligibility depends on conditions.");
  if (route.eligibility === "unknown") reasons.push("Source does not state eligibility.");
  if (exceedsStay) reasons.push("Trip is longer than the verified permitted stay.");
  if (input && route.stay_days == null && (route.eligibility === "visa_free" || route.eligibility === "simplified"))
    reasons.push("Permitted stay is not verified.");

  if (
    verified &&
    !stale &&
    (route.eligibility === "visa_free" || route.eligibility === "simplified") &&
    route.conditions.length === 0 &&
    !exceedsStay &&
    (!input || route.stay_days != null)
  ) {
    return { status: "green", reasons: ["Verified, current source confirms visa-free or simplified entry."], stale, exceedsStay };
  }

  return { status: "amber", reasons, stale, exceedsStay };
}

export function show<T>(v: T | null | undefined, fmt?: (v: T) => string): string {
  if (v === null || v === undefined || v === "") return NOT_VERIFIED;
  return fmt ? fmt(v) : String(v);
}
