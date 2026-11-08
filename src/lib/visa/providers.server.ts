// Provider adapter layer. Server-only — keys are read from process.env inside calls.
// No scraping: adapters only call documented, licensed APIs when a key is configured.
import type { SearchInput, VisaRoute } from "./types";
import { SAMPLE_ROUTES } from "./sample-data";

export interface VisaProvider {
  id: string;
  name: string;
  live: boolean;
  isConfigured(): boolean;
  lookup(input: SearchInput): Promise<VisaRoute | null>;
}

function env(name: string): string | undefined {
  return process.env[name] || undefined;
}

/**
 * Generic HTTP adapter. Each provider's response must be mapped into VisaRoute in `map`.
 * Mapping must only copy fields the provider actually returns; everything else stays null.
 */
function httpProvider(opts: {
  id: string;
  name: string;
  keyVar: string;
  baseUrlVar: string;
  buildUrl: (base: string, i: SearchInput) => string;
  headers: (key: string) => Record<string, string>;
  map: (json: unknown, i: SearchInput) => VisaRoute | null;
}): VisaProvider {
  return {
    id: opts.id,
    name: opts.name,
    live: true,
    isConfigured: () => !!env(opts.keyVar) && !!env(opts.baseUrlVar),
    async lookup(input) {
      const key = env(opts.keyVar)!;
      const base = env(opts.baseUrlVar)!;
      const res = await fetch(opts.buildUrl(base, input), { headers: opts.headers(key) });
      if (!res.ok) throw new Error(`${opts.name} responded ${res.status}`);
      return opts.map(await res.json(), input);
    },
  };
}

type Rec = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);

function mapGeneric(sourceType: VisaRoute["source_type"]) {
  return (json: unknown, i: SearchInput): VisaRoute | null => {
    if (!json || typeof json !== "object") return null;
    const j = json as Rec;
    const elig = str(j["eligibility"] ?? j["requirement"]);
    const eligibility: VisaRoute["eligibility"] =
      elig && ["visa_free", "simplified", "visa_required", "ineligible", "conditional"].includes(elig)
        ? (elig as VisaRoute["eligibility"])
        : "unknown";
    const sourceUrl = str(j["source_url"] ?? j["official_source"]);
    const checked = str(j["checked_at"] ?? j["last_checked"]);
    return {
      id: `${sourceType}-${i.nationality}-${i.destination}-${i.purpose}`,
      nationality: i.nationality,
      residence: i.residence || null,
      destination: i.destination,
      purpose: i.purpose,
      visa_type: str(j["visa_type"]),
      eligibility,
      stay_days: num(j["stay_days"] ?? j["max_stay_days"]),
      fee: num(j["fee"]),
      currency: str(j["currency"]),
      processing: str(j["processing"] ?? j["processing_time"]),
      official_apply_url: str(j["official_apply_url"] ?? j["apply_url"]),
      source_url: sourceUrl,
      source_type: sourceType,
      checked_at: checked,
      review_after: str(j["review_after"]),
      confidence: sourceUrl && checked ? "verified" : "unverified",
      conditions: Array.isArray(j["conditions"]) ? (j["conditions"] as unknown[]).filter((c): c is string => typeof c === "string") : [],
      documents: Array.isArray(j["documents"])
        ? (j["documents"] as unknown[]).filter((d): d is string => typeof d === "string").map((label, n) => ({ id: `d${n}`, route_id: "live", label, required: true }))
        : [],
      sources: sourceUrl ? [{ id: "live", title: sourceType, source_url: sourceUrl, source_type: sourceType, checked_at: checked }] : [],
      illustrative: false,
    };
  };
}

const qs = (i: SearchInput) =>
  new URLSearchParams({ passport: i.nationality, destination: i.destination, purpose: i.purpose, residence: i.residence }).toString();

export const PROVIDERS: VisaProvider[] = [
  httpProvider({
    id: "timatic",
    name: "IATA Timatic",
    keyVar: "TIMATIC_API_KEY",
    baseUrlVar: "TIMATIC_BASE_URL",
    buildUrl: (b, i) => `${b}/requirements?${qs(i)}`,
    headers: (k) => ({ Authorization: `Bearer ${k}` }),
    map: mapGeneric("provider_timatic"),
  }),
  httpProvider({
    id: "passportbase",
    name: "PassportBase",
    keyVar: "PASSPORTBASE_API_KEY",
    baseUrlVar: "PASSPORTBASE_BASE_URL",
    buildUrl: (b, i) => `${b}/requirements?${qs(i)}`,
    headers: (k) => ({ "x-api-key": k }),
    map: mapGeneric("provider_passportbase"),
  }),
  httpProvider({
    id: "visamundi",
    name: "Visamundi",
    keyVar: "VISAMUNDI_API_KEY",
    baseUrlVar: "VISAMUNDI_BASE_URL",
    buildUrl: (b, i) => `${b}/requirements?${qs(i)}`,
    headers: (k) => ({ Authorization: `Bearer ${k}` }),
    map: mapGeneric("provider_visamundi"),
  }),
];

export const curatedProvider: VisaProvider = {
  id: "curated",
  name: "Curated demo data",
  live: false,
  isConfigured: () => true,
  async lookup(i) {
    return SAMPLE_ROUTES.find((r) => r.nationality === i.nationality && r.destination === i.destination && r.purpose === i.purpose) ?? null;
  },
};

export function activeProvider(): VisaProvider {
  const pref = env("VISA_PROVIDER");
  const configured = PROVIDERS.filter((p) => p.isConfigured());
  return configured.find((p) => p.id === pref) ?? configured[0] ?? curatedProvider;
}
