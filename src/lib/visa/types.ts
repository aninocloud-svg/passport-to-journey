// Data model for VisaPath. Mirrors the conceptual tables:
// countries, visa_routes, route_documents, sources.

export type Purpose = "tourism" | "business" | "transit" | "study" | "work" | "family";

export const PURPOSES: { value: Purpose; label: string }[] = [
  { value: "tourism", label: "Tourism" },
  { value: "business", label: "Business" },
  { value: "transit", label: "Transit" },
  { value: "study", label: "Study" },
  { value: "work", label: "Work" },
  { value: "family", label: "Family visit" },
];

/** What the source says about eligibility. "unknown" when the source is silent. */
export type Eligibility =
  | "visa_free"
  | "simplified" // eTA / ETA / e-visa / visa on arrival
  | "visa_required"
  | "ineligible"
  | "conditional"
  | "unknown";

export type SourceType = "official_government" | "provider_passportbase" | "provider_visamundi" | "provider_timatic" | "curated_demo";

export type Confidence = "verified" | "unverified" | "illustrative";

export interface Country {
  code: string; // ISO 3166-1 alpha-2
  name: string;
  region: string;
  flag: string;
  independent: boolean;
}

export interface Source {
  id: string;
  title: string;
  source_url: string;
  source_type: SourceType;
  checked_at: string | null; // ISO date
}

export interface RouteDocument {
  id: string;
  route_id: string;
  label: string;
  required: boolean;
}

export interface VisaRoute {
  id: string;
  nationality: string; // ISO2
  residence: string | null; // ISO2 or null = any
  destination: string; // ISO2
  purpose: Purpose;
  visa_type: string | null;
  eligibility: Eligibility;
  stay_days: number | null;
  fee: number | null;
  currency: string | null;
  processing: string | null;
  official_apply_url: string | null;
  source_url: string | null;
  source_type: SourceType;
  checked_at: string | null;
  review_after: string | null;
  confidence: Confidence;
  conditions: string[];
  documents: RouteDocument[];
  sources: Source[];
  illustrative: boolean;
}

export interface SearchInput {
  nationality: string;
  residence: string;
  destination: string;
  purpose: Purpose;
  arrival: string; // yyyy-mm-dd
  duration: number;
}

export type Status = "green" | "amber" | "red";

export interface Assessment {
  status: Status;
  reasons: string[];
  stale: boolean;
  exceedsStay: boolean;
}

export interface LookupResult {
  input: SearchInput;
  route: VisaRoute | null;
  assessment: Assessment;
  provider: { id: string; name: string; live: boolean };
  officialLinks: { label: string; url: string }[];
}
