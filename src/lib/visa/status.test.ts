import { describe, expect, it } from "vitest";
import { assess, isStale, show, NOT_VERIFIED } from "./status";
import type { VisaRoute } from "./types";

const now = new Date("2026-11-08");
const verified: VisaRoute = {
  id: "t", nationality: "AA", residence: null, destination: "BB", purpose: "tourism",
  visa_type: "Visa-free", eligibility: "visa_free", stay_days: 90, fee: null, currency: null, processing: null,
  official_apply_url: null, source_url: "https://gov.example", source_type: "official_government",
  checked_at: "2026-10-01", review_after: "2027-01-01", confidence: "verified", conditions: [],
  documents: [], sources: [], illustrative: false,
};

describe("status logic", () => {
  it("green only for verified fresh visa-free", () => {
    expect(assess(verified, { duration: 30 }, now).status).toBe("green");
  });
  it("simplified verified is green", () => {
    expect(assess({ ...verified, eligibility: "simplified" }, { duration: 30 }, now).status).toBe("green");
  });
  it("red for verified visa required", () => {
    expect(assess({ ...verified, eligibility: "visa_required" }, { duration: 30 }, now).status).toBe("red");
  });
  it("red for verified ineligible", () => {
    expect(assess({ ...verified, eligibility: "ineligible" }, undefined, now).status).toBe("red");
  });
  it("amber when no data", () => {
    expect(assess(null, { duration: 5 }, now).status).toBe("amber");
  });
  it("amber for conditional", () => {
    expect(assess({ ...verified, conditions: ["x"] }, { duration: 5 }, now).status).toBe("amber");
  });
  it("amber for illustrative data even if visa-free", () => {
    expect(assess({ ...verified, illustrative: true, confidence: "illustrative" }, { duration: 5 }, now).status).toBe("amber");
  });
  it("amber when trip exceeds verified stay", () => {
    expect(assess(verified, { duration: 120 }, now).status).toBe("amber");
  });
  it("amber when visa-free but stay unknown", () => {
    expect(assess({ ...verified, stay_days: null }, { duration: 5 }, now).status).toBe("amber");
  });
  it("amber (not red) for visa_required without source", () => {
    expect(assess({ ...verified, eligibility: "visa_required", source_url: null }, undefined, now).status).toBe("amber");
  });
});

describe("stale data", () => {
  it("stale after review_after", () => {
    expect(isStale({ checked_at: "2025-01-01", review_after: "2026-01-01" }, now)).toBe(true);
  });
  it("stale when never checked", () => {
    expect(isStale({ checked_at: null, review_after: "2027-01-01" }, now)).toBe(true);
  });
  it("fresh within review window", () => {
    expect(isStale({ checked_at: "2026-10-01", review_after: "2027-01-01" }, now)).toBe(false);
  });
  it("stale visa-free downgrades to amber", () => {
    expect(assess({ ...verified, review_after: "2026-01-01" }, { duration: 5 }, now).status).toBe("amber");
  });
  it("stale visa-required downgrades to amber", () => {
    expect(assess({ ...verified, eligibility: "visa_required", review_after: "2026-01-01" }, undefined, now).status).toBe("amber");
  });
});

describe("unknown fields", () => {
  it("shows Not verified yet", () => {
    expect(show(null)).toBe(NOT_VERIFIED);
    expect(show(40, (v) => `${v} USD`)).toBe("40 USD");
  });
});
